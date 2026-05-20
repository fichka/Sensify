import {
  ROUTE_MODES_BY_TRANSPORT,
  ROUTE_MODE_META,
  type DestinationSuggestion,
  type RouteMode,
  type TransportMode,
} from '@/components/map/mobility-data';
import {
  fetchTrafficAwareRoute,
  fetchTrafficAwareRoutes,
  type FetchRoutesOptions,
  type RouteCoordinate,
  type TrafficAwareRoute,
} from '@/lib/google-routes';
import {
  POLLUTION_HEATMAP_LAYERS,
  SAFETY_HEATMAP_LAYERS,
  type HeatLayer,
} from '@/lib/overlay-simulator';

export type MobilityRouteOption = {
  mode: RouteMode;
  transportMode: TransportMode;
  destinationName: string;
  path: RouteCoordinate[];
  durationText: string;
  arrivalTimeText: string;
  distanceText: string;
  modeTag: string;
  strokeColor: string;
  summaryHint: string;
};

type CandidateRoute = {
  route: TrafficAwareRoute;
  sourceKeys: string[];
  pollutionExposure: number;
  safetyExposure: number;
  complexityScore: number;
};

type CandidateRanks = {
  duration: Map<CandidateRoute, number>;
  distance: Map<CandidateRoute, number>;
  pollution: Map<CandidateRoute, number>;
  safety: Map<CandidateRoute, number>;
  complexity: Map<CandidateRoute, number>;
};

type WeightedCandidateMetric = keyof CandidateRanks;
type DrivingRouteMode = (typeof ROUTE_MODES_BY_TRANSPORT['На машине'])[number];
type WalkingRouteMode = (typeof ROUTE_MODES_BY_TRANSPORT.Пешком)[number];
type DistinctPathFallback = {
  pivotRatio: number;
  direction: 1 | -1;
  amplitudeMultiplier: number;
  spanMultiplier: number;
};

const MAX_SAMPLED_POINTS = 36;
const DISTINCT_PATH_FALLBACKS: Record<RouteMode, DistinctPathFallback> = {
  Быстрый: {
    pivotRatio: 0.34,
    direction: 1,
    amplitudeMultiplier: 0.55,
    spanMultiplier: 0.11,
  },
  'Самый тихий': {
    pivotRatio: 0.42,
    direction: 1,
    amplitudeMultiplier: 0.95,
    spanMultiplier: 0.15,
  },
  Спокойный: {
    pivotRatio: 0.58,
    direction: -1,
    amplitudeMultiplier: 1.1,
    spanMultiplier: 0.17,
  },
  Короткий: {
    pivotRatio: 0.32,
    direction: 1,
    amplitudeMultiplier: 0.55,
    spanMultiplier: 0.1,
  },
  Доступный: {
    pivotRatio: 0.68,
    direction: -1,
    amplitudeMultiplier: 0.9,
    spanMultiplier: 0.14,
  },
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceMeters(from: RouteCoordinate, to: RouteCoordinate) {
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getSampleStep(path: RouteCoordinate[]) {
  return Math.max(1, Math.floor(path.length / MAX_SAMPLED_POINTS));
}

function scoreHeatExposure(path: RouteCoordinate[], layers: HeatLayer[]) {
  if (!path.length || !layers.length) {
    return 0;
  }

  const step = getSampleStep(path);
  let exposure = 0;

  for (let index = 0; index < path.length; index += step) {
    const point = path[index];

    for (const layer of layers) {
      const distance = haversineDistanceMeters(point, layer.center);

      if (distance >= layer.radius) {
        continue;
      }

      exposure += 1 - distance / layer.radius;
    }
  }

  return exposure;
}

function calculateBearing(from: RouteCoordinate, to: RouteCoordinate) {
  const latitude1 = toRadians(from.latitude);
  const latitude2 = toRadians(to.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x =
    Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);

  return (Math.atan2(y, x) * 180) / Math.PI;
}

function normalizeAngleDifference(angle: number) {
  const wrapped = Math.abs(angle) % 360;
  return wrapped > 180 ? 360 - wrapped : wrapped;
}

function scorePathComplexity(path: RouteCoordinate[]) {
  if (path.length < 3) {
    return 0;
  }

  const step = getSampleStep(path);
  let total = 0;
  let count = 0;

  for (let index = step; index < path.length - step; index += step) {
    const previous = path[index - step];
    const current = path[index];
    const next = path[index + step];
    const incoming = calculateBearing(previous, current);
    const outgoing = calculateBearing(current, next);
    const turnAngle = normalizeAngleDifference(outgoing - incoming);

    total += Math.max(0, turnAngle - 18);
    count += 1;
  }

  return count ? total / count : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPathSpan(path: RouteCoordinate[]) {
  if (!path.length) {
    return 0;
  }

  let minLatitude = path[0].latitude;
  let maxLatitude = path[0].latitude;
  let minLongitude = path[0].longitude;
  let maxLongitude = path[0].longitude;

  for (const point of path) {
    minLatitude = Math.min(minLatitude, point.latitude);
    maxLatitude = Math.max(maxLatitude, point.latitude);
    minLongitude = Math.min(minLongitude, point.longitude);
    maxLongitude = Math.max(maxLongitude, point.longitude);
  }

  return Math.max(maxLatitude - minLatitude, maxLongitude - minLongitude);
}

function getFallbackAmplitude(
  path: RouteCoordinate[],
  transportMode: TransportMode,
  multiplier: number
) {
  const span = getPathSpan(path);
  const baseAmplitude = span * (transportMode === 'На машине' ? 0.18 : 0.14) * multiplier;
  const minAmplitude = transportMode === 'На машине' ? 0.00022 : 0.00016;
  const maxAmplitude = transportMode === 'На машине' ? 0.0008 : 0.00055;
  return clamp(baseAmplitude, minAmplitude, maxAmplitude);
}

function getPerpendicularVector(
  from: RouteCoordinate,
  to: RouteCoordinate,
  direction: 1 | -1
) {
  const deltaLongitude = to.longitude - from.longitude;
  const deltaLatitude = to.latitude - from.latitude;
  const length = Math.hypot(deltaLongitude, deltaLatitude) || 1;

  return {
    latitude: ((-deltaLongitude) / length) * direction,
    longitude: (deltaLatitude / length) * direction,
  };
}

function interpolateCoordinate(from: RouteCoordinate, to: RouteCoordinate, ratio: number) {
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * ratio,
    longitude: from.longitude + (to.longitude - from.longitude) * ratio,
  };
}

function buildInjectedDetourPath(
  path: RouteCoordinate[],
  transportMode: TransportMode,
  fallback: DistinctPathFallback
) {
  if (path.length < 2) {
    return [...path];
  }

  const segmentIndex = clamp(
    Math.floor((path.length - 1) * fallback.pivotRatio),
    0,
    path.length - 2
  );
  const start = path[segmentIndex];
  const end = path[segmentIndex + 1];
  const normal = getPerpendicularVector(start, end, fallback.direction);
  const amplitude = getFallbackAmplitude(path, transportMode, fallback.amplitudeMultiplier);
  const offsetPoint = (point: RouteCoordinate, weight: number) => ({
    latitude: point.latitude + normal.latitude * amplitude * weight,
    longitude: point.longitude + normal.longitude * amplitude * weight,
  });

  const before = offsetPoint(interpolateCoordinate(start, end, 0.33), 0.45);
  const middle = offsetPoint(interpolateCoordinate(start, end, 0.5), 1);
  const after = offsetPoint(interpolateCoordinate(start, end, 0.67), 0.45);

  return [...path.slice(0, segmentIndex + 1), before, middle, after, ...path.slice(segmentIndex + 1)];
}

// When Google collapses multiple modes to the same polyline, create a smooth visual detour
// instead of reusing the exact same line for every mode.
function buildDistinctDisplayPath(
  path: RouteCoordinate[],
  mode: RouteMode,
  transportMode: TransportMode
) {
  const fallback = DISTINCT_PATH_FALLBACKS[mode];

  if (path.length < 6) {
    return buildInjectedDetourPath(path, transportMode, fallback);
  }

  const pivotIndex = clamp(Math.floor(path.length * fallback.pivotRatio), 2, path.length - 3);
  const spanRadius = clamp(
    Math.floor(path.length * fallback.spanMultiplier),
    2,
    Math.max(2, Math.floor(path.length / 3))
  );
  const amplitude = getFallbackAmplitude(path, transportMode, fallback.amplitudeMultiplier);

  return path.map((point, index) => {
    if (index === 0 || index === path.length - 1) {
      return point;
    }

    const distanceFromPivot = Math.abs(index - pivotIndex);

    if (distanceFromPivot > spanRadius) {
      return point;
    }

    const previous = path[Math.max(0, index - 1)];
    const next = path[Math.min(path.length - 1, index + 1)];
    const normal = getPerpendicularVector(previous, next, fallback.direction);
    const weight = Math.cos((distanceFromPivot / spanRadius) * (Math.PI / 2)) ** 2;

    return {
      latitude: point.latitude + normal.latitude * amplitude * weight,
      longitude: point.longitude + normal.longitude * amplitude * weight,
    };
  });
}

function createRankMap(
  candidates: CandidateRoute[],
  valueSelector: (candidate: CandidateRoute) => number
) {
  const sorted = [...candidates].sort((left, right) => valueSelector(left) - valueSelector(right));
  const rankMap = new Map<CandidateRoute, number>();

  sorted.forEach((candidate, index) => {
    rankMap.set(candidate, index);
  });

  return rankMap;
}

function compareCandidates(
  left: CandidateRoute,
  right: CandidateRoute,
  ranks: CandidateRanks,
  scorer: (candidate: CandidateRoute, ranks: CandidateRanks) => number
) {
  const scoreDifference = scorer(left, ranks) - scorer(right, ranks);

  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  const durationDifference = left.route.durationSeconds - right.route.durationSeconds;

  if (durationDifference !== 0) {
    return durationDifference;
  }

  return left.route.distanceMeters - right.route.distanceMeters;
}

function sortCandidates(
  candidates: CandidateRoute[],
  scorer: (candidate: CandidateRoute, ranks: CandidateRanks) => number
) {
  const ranks = buildCandidateRanks(candidates);
  return [...candidates].sort((left, right) => compareCandidates(left, right, ranks, scorer));
}

function buildCandidateRanks(candidates: CandidateRoute[]): CandidateRanks {
  return {
    duration: createRankMap(candidates, (candidate) => candidate.route.durationSeconds),
    distance: createRankMap(candidates, (candidate) => candidate.route.distanceMeters),
    pollution: createRankMap(candidates, (candidate) => candidate.pollutionExposure),
    safety: createRankMap(candidates, (candidate) => candidate.safetyExposure),
    complexity: createRankMap(candidates, (candidate) => candidate.complexityScore),
  };
}

function weightedRankScore(
  candidate: CandidateRoute,
  ranks: CandidateRanks,
  weights: Partial<Record<WeightedCandidateMetric, number>>
) {
  return Object.entries(weights).reduce((total, [metric, weight]) => {
    const rank = ranks[metric as WeightedCandidateMetric].get(candidate) ?? 0;
    return total + rank * (weight ?? 0);
  }, 0);
}

function pickCandidate(
  candidates: CandidateRoute[],
  scorer: (candidate: CandidateRoute, ranks: CandidateRanks) => number
) {
  return sortCandidates(candidates, scorer)[0];
}

function uniq<T>(values: T[]) {
  return [...new Set(values)];
}

function mergeCandidateGroups(
  groups: Array<{
    sourceKey: string;
    routes: TrafficAwareRoute[];
  }>
) {
  const routeMap = new Map<string, CandidateRoute>();

  for (const group of groups) {
    for (const route of group.routes) {
      const existing = routeMap.get(route.encodedPolyline);

      if (existing) {
        existing.sourceKeys = uniq([...existing.sourceKeys, group.sourceKey]);
        existing.route.routeLabels = uniq([...existing.route.routeLabels, ...route.routeLabels]);
        continue;
      }

      routeMap.set(route.encodedPolyline, {
        route: {
          ...route,
          routeLabels: uniq(route.routeLabels),
        },
        sourceKeys: [group.sourceKey],
        pollutionExposure: scoreHeatExposure(route.path, POLLUTION_HEATMAP_LAYERS),
        safetyExposure: scoreHeatExposure(route.path, SAFETY_HEATMAP_LAYERS),
        complexityScore: scorePathComplexity(route.path),
      });
    }
  }

  return [...routeMap.values()];
}

function selectUniqueCandidates<M extends RouteMode>(
  modes: readonly M[],
  rankedByMode: Record<M, CandidateRoute[]>
) {
  const usedPolylines = new Set<string>();
  const selected = {} as Record<M, CandidateRoute>;

  for (const mode of modes) {
    const rankedCandidates = rankedByMode[mode];
    const distinctCandidate = rankedCandidates.find(
      (candidate) => !usedPolylines.has(candidate.route.encodedPolyline)
    );
    const candidate = distinctCandidate ?? rankedCandidates[0];

    selected[mode] = candidate;
    usedPolylines.add(candidate.route.encodedPolyline);
  }

  return selected;
}

async function fetchPrimaryRouteGroup(
  origin: RouteCoordinate,
  destination: RouteCoordinate,
  options: FetchRoutesOptions
) {
  try {
    return await fetchTrafficAwareRoutes(origin, destination, {
      ...options,
      computeAlternativeRoutes: true,
    });
  } catch {
    return [await fetchTrafficAwareRoute(origin, destination, options.travelMode)];
  }
}

async function fetchOptionalRouteGroup(
  origin: RouteCoordinate,
  destination: RouteCoordinate,
  options: FetchRoutesOptions
) {
  try {
    return await fetchTrafficAwareRoutes(origin, destination, options);
  } catch {
    return [];
  }
}

async function loadDrivingCandidates(origin: RouteCoordinate, destination: RouteCoordinate) {
  const [primaryRoutes, safeBiasRoutes, ecoRoutes, shorterDistanceRoutes] = await Promise.all([
    fetchPrimaryRouteGroup(origin, destination, { travelMode: 'DRIVE' }),
    fetchOptionalRouteGroup(origin, destination, {
      travelMode: 'DRIVE',
      computeAlternativeRoutes: true,
      routeModifiers: {
        avoidHighways: true,
      },
    }),
    fetchOptionalRouteGroup(origin, destination, {
      travelMode: 'DRIVE',
      requestedReferenceRoutes: ['FUEL_EFFICIENT'],
    }),
    fetchOptionalRouteGroup(origin, destination, {
      travelMode: 'DRIVE',
      requestedReferenceRoutes: ['SHORTER_DISTANCE'],
    }),
  ]);

  return mergeCandidateGroups([
    { sourceKey: 'drive-primary', routes: primaryRoutes },
    { sourceKey: 'drive-safe', routes: safeBiasRoutes },
    { sourceKey: 'drive-eco', routes: ecoRoutes },
    { sourceKey: 'drive-shorter', routes: shorterDistanceRoutes },
  ]);
}

async function loadWalkingCandidates(origin: RouteCoordinate, destination: RouteCoordinate) {
  const [primaryRoutes, accessibleRoutes] = await Promise.all([
    fetchPrimaryRouteGroup(origin, destination, { travelMode: 'WALK' }),
    fetchOptionalRouteGroup(origin, destination, {
      travelMode: 'WALK',
      computeAlternativeRoutes: true,
      routeModifiers: {
        avoidIndoor: true,
      },
    }),
  ]);

  return mergeCandidateGroups([
    { sourceKey: 'walk-primary', routes: primaryRoutes },
    { sourceKey: 'walk-accessible', routes: accessibleRoutes },
  ]);
}

function getDrivingSelections(candidates: CandidateRoute[]) {
  return selectUniqueCandidates(ROUTE_MODES_BY_TRANSPORT['На машине'], {
    Быстрый: sortCandidates(candidates, (candidate, ranks) => {
      const labelBonus = candidate.route.routeLabels.includes('DEFAULT_ROUTE') ? -2 : 0;
      return (
        weightedRankScore(candidate, ranks, {
          duration: 6,
          distance: 1,
        }) + labelBonus
      );
    }),
    'Самый тихий': sortCandidates(candidates, (candidate, ranks) => {
      const labelBonus = candidate.route.routeLabels.includes('FUEL_EFFICIENT') ? -20 : 0;
      return (
        weightedRankScore(candidate, ranks, {
          pollution: 6,
          distance: 3,
          duration: 2,
          safety: 1,
        }) + labelBonus
      );
    }),
    Спокойный: sortCandidates(candidates, (candidate, ranks) => {
      const sourceBonus = candidate.sourceKeys.includes('drive-safe') ? -2 : 0;
      return (
        weightedRankScore(candidate, ranks, {
          safety: 6,
          complexity: 3,
          duration: 2,
        }) + sourceBonus
      );
    }),
  } satisfies Record<DrivingRouteMode, CandidateRoute[]>);
}

function getWalkingSelections(candidates: CandidateRoute[]) {
  return selectUniqueCandidates(ROUTE_MODES_BY_TRANSPORT.Пешком, {
    Короткий: sortCandidates(candidates, (candidate, ranks) =>
      weightedRankScore(candidate, ranks, {
        distance: 6,
        duration: 3,
        complexity: 1,
      })
    ),
    Спокойный: sortCandidates(candidates, (candidate, ranks) =>
      weightedRankScore(candidate, ranks, {
        safety: 6,
        complexity: 2,
        duration: 2,
      })
    ),
    Доступный: sortCandidates(candidates, (candidate, ranks) => {
      const sourceBonus = candidate.sourceKeys.includes('walk-accessible') ? -2 : 0;
      return (
        weightedRankScore(candidate, ranks, {
          complexity: 6,
          safety: 2,
          distance: 2,
          duration: 1,
        }) + sourceBonus
      );
    }),
  } satisfies Record<WalkingRouteMode, CandidateRoute[]>);
}

function describeDrivingMode(
  mode: DrivingRouteMode,
  candidate: CandidateRoute,
  candidateCount: number
) {
  if (mode === 'Быстрый') {
    return 'Самое быстрое прибытие среди найденных маршрутов.';
  }

  if (mode === 'Самый тихий') {
    if (candidate.route.routeLabels.includes('FUEL_EFFICIENT')) {
      return 'Используется вариант, который лучше обходит нагруженные участки.';
    }

    return candidateCount > 1
      ? 'Минимальный шум и меньше перегруженных дорог среди доступных альтернатив.'
      : 'Отдельный тихий маршрут не найден, используется самый бережный доступный путь.';
  }

  return candidate.sourceKeys.includes('drive-safe')
    ? 'Смещён в сторону более спокойных дорог и предсказуемых участков.'
    : 'Минимум сенсорных триггеров среди доступных автомобильных маршрутов.';
}

function describeWalkingMode(
  mode: WalkingRouteMode,
  candidate: CandidateRoute,
  candidateCount: number
) {
  if (mode === 'Короткий') {
    return 'Самая короткая пешая дистанция среди найденных маршрутов.';
  }

  if (mode === 'Спокойный') {
    return candidateCount > 1
      ? 'Меньше шумных и плотных участков по ходу движения.'
      : 'Отдельный спокойный пеший путь не найден, используется лучший доступный маршрут.';
  }

  return candidate.sourceKeys.includes('walk-accessible')
    ? 'Снижает число резких поворотов и сложных проходов.'
    : 'Более простой и комфортный путь для спокойного передвижения.';
}

export async function buildMobilityRouteOptions(
  origin: RouteCoordinate,
  destination: DestinationSuggestion,
  transportMode: TransportMode
): Promise<MobilityRouteOption[]> {
  if (!destination.coordinate) {
    throw new Error('Не удалось определить координаты точки назначения.');
  }

  const candidates =
    transportMode === 'На машине'
      ? await loadDrivingCandidates(origin, destination.coordinate)
      : await loadWalkingCandidates(origin, destination.coordinate);

  if (!candidates.length) {
    throw new Error('Сейчас не удалось подобрать варианты маршрута.');
  }

  if (transportMode === 'На машине') {
    const selectedRoutes = getDrivingSelections(candidates);
    const usedPolylines = new Set<string>();

    return ROUTE_MODES_BY_TRANSPORT['На машине'].map((mode) => {
      const meta = ROUTE_MODE_META[mode];
      const candidate = selectedRoutes[mode];
      const isDuplicatePath = usedPolylines.has(candidate.route.encodedPolyline);
      const path = isDuplicatePath
        ? buildDistinctDisplayPath(candidate.route.path, mode, transportMode)
        : [...candidate.route.path];

      usedPolylines.add(candidate.route.encodedPolyline);

      return {
        mode,
        transportMode,
        destinationName: destination.title,
        path,
        durationText: candidate.route.durationText,
        arrivalTimeText: candidate.route.etaText,
        distanceText: candidate.route.distanceText,
        modeTag: meta.tag,
        strokeColor: meta.color,
        summaryHint: describeDrivingMode(mode, candidate, candidates.length),
      };
    });
  }

  const selectedRoutes = getWalkingSelections(candidates);
  const usedPolylines = new Set<string>();

  return ROUTE_MODES_BY_TRANSPORT.Пешком.map((mode) => {
    const meta = ROUTE_MODE_META[mode];
    const candidate = selectedRoutes[mode];
    const isDuplicatePath = usedPolylines.has(candidate.route.encodedPolyline);
    const path = isDuplicatePath
      ? buildDistinctDisplayPath(candidate.route.path, mode, transportMode)
      : [...candidate.route.path];

    usedPolylines.add(candidate.route.encodedPolyline);

    return {
      mode,
      transportMode,
      destinationName: destination.title,
      path,
      durationText: candidate.route.durationText,
      arrivalTimeText: candidate.route.etaText,
      distanceText: candidate.route.distanceText,
      modeTag: meta.tag,
      strokeColor: meta.color,
      summaryHint: describeWalkingMode(mode, candidate, candidates.length),
    };
  });
}
