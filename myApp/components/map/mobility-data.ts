import type { RouteCoordinate, RouteTravelMode } from '@/lib/google-routes';

export type TransportMode = 'Пешком' | 'На машине';

export type RouteMode = 'Спокойный' | 'Самый тихий' | 'Быстрый' | 'Короткий' | 'Доступный';

export type DestinationSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  coordinate?: RouteCoordinate;
  placeId?: string;
  hint: string;
};

export type OverlayCircle = {
  id: string;
  center: RouteCoordinate;
  radius: number;
  fillColor: string;
  strokeColor: string;
};

export type OverlayPolygon = {
  id: string;
  coordinates: RouteCoordinate[];
  fillColor: string;
  strokeColor: string;
};

export const TRANSPORT_MODE_META: Record<
  TransportMode,
  {
    icon: string;
    color: string;
    travelMode: RouteTravelMode;
  }
> = {
  'На машине': {
    icon: 'car-outline',
    color: '#2D7BFF',
    travelMode: 'DRIVE',
  },
  Пешком: {
    icon: 'walk-outline',
    color: '#12A66B',
    travelMode: 'WALK',
  },
};

export const ROUTE_MODES_BY_TRANSPORT = {
  'На машине': ['Быстрый', 'Самый тихий', 'Спокойный'],
  Пешком: ['Короткий', 'Спокойный', 'Доступный'],
} as const satisfies Record<TransportMode, readonly RouteMode[]>;

export const ROUTE_MODE_META: Record<
  RouteMode,
  { tag: string; color: string; icon: string; description: string }
> = {
  Быстрый: {
    tag: 'Минимум времени',
    color: '#4DA3FF',
    icon: 'flash-outline',
    description: 'Маршрут с минимальным временем в пути.',
  },
  'Самый тихий': {
    tag: 'Фокус на шуме',
    color: '#35C98F',
    icon: 'volume-mute-outline',
    description: 'Избегает шумных дорог и перегруженных узлов.',
  },
  Спокойный: {
    tag: 'Меньше триггеров',
    color: '#FFB347',
    icon: 'shield-checkmark-outline',
    description: 'Балансирует шум, толпу и предсказуемость пути.',
  },
  Короткий: {
    tag: 'Минимальная дистанция',
    color: '#12A66B',
    icon: 'trail-sign-outline',
    description: 'Самая короткая пешая траектория.',
  },
  Доступный: {
    tag: 'Одна рука и комфорт',
    color: '#A678FF',
    icon: 'accessibility-outline',
    description: 'Больше удобных проходов и меньше резких поворотов.',
  },
};

export const DESTINATION_SUGGESTIONS: DestinationSuggestion[] = [
  {
    id: 'school',
    title: 'Школа №56',
    subtitle: 'Утренний маршрут',
    hint: 'Путь с тихим двором и комнатой разгрузки',
    coordinate: { latitude: 43.2738, longitude: 76.8221 },
  },
  {
    id: 'library',
    title: 'Городская библиотека',
    subtitle: 'Тихая зона',
    hint: 'Подходит для паузы и восстановления',
    coordinate: { latitude: 43.2295, longitude: 76.8412 },
  },
  {
    id: 'clinic',
    title: 'Поликлиника №7',
    subtitle: 'Медицинская точка',
    hint: 'Безопасная точка ожидания и поддержки',
    coordinate: { latitude: 43.2261, longitude: 76.8564 },
  },
  {
    id: 'home',
    title: 'Дом',
    subtitle: 'Любимый маршрут',
    hint: 'Кратчайший путь домой с низким шумом',
    coordinate: { latitude: 43.2662, longitude: 76.9286 },
  },
  {
    id: 'park',
    title: 'Сквер у Панфилова',
    subtitle: 'Тихая прогулка',
    hint: 'Зелёный участок для мягкой адаптации',
    coordinate: { latitude: 43.2612, longitude: 76.9456 },
  },
  {
    id: 'sensory-room',
    title: 'Сенсорная комната',
    subtitle: 'Точка поддержки',
    hint: 'Куда уйти при перегрузке',
    coordinate: { latitude: 43.2661, longitude: 76.8226 },
  },
];

export const ECO_OVERLAY_ZONES: OverlayCircle[] = [
  {
    id: 'quiet-1',
    center: { latitude: 43.2483, longitude: 76.8721 },
    radius: 760,
    fillColor: 'rgba(53, 201, 143, 0.14)',
    strokeColor: 'rgba(53, 201, 143, 0.28)',
  },
  {
    id: 'quiet-2',
    center: { latitude: 43.2612, longitude: 76.8404 },
    radius: 620,
    fillColor: 'rgba(90, 214, 164, 0.12)',
    strokeColor: 'rgba(90, 214, 164, 0.24)',
  },
];

export const SAFETY_OVERLAY_AREAS: OverlayPolygon[] = [
  {
    id: 'crowd-1',
    coordinates: [
      { latitude: 43.2449, longitude: 76.8944 },
      { latitude: 43.2518, longitude: 76.9072 },
      { latitude: 43.2411, longitude: 76.9165 },
      { latitude: 43.2337, longitude: 76.9012 },
    ],
    fillColor: 'rgba(255, 179, 71, 0.10)',
    strokeColor: 'rgba(255, 179, 71, 0.26)',
  },
];

export const ACCESSIBILITY_OVERLAY_ZONES: OverlayCircle[] = [
  {
    id: 'access-1',
    center: { latitude: 43.2381, longitude: 76.8874 },
    radius: 520,
    fillColor: 'rgba(166, 120, 255, 0.12)',
    strokeColor: 'rgba(166, 120, 255, 0.28)',
  },
];
