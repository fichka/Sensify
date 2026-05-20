export type NoiseRiskLevel = 'low' | 'medium' | 'high';

export type NoiseAlert = {
  id: string;
  title: string;
  address: string;
  timeText: string;
  level: NoiseRiskLevel;
  levelLabel: string;
  levelColor: string;
  levelBackground: string;
  icon: string;
  markerColor: string;
  markerPosition: {
    top: string;
    left: string;
  };
  details: string;
};

export type SensoryMetric = {
  id: string;
  title: string;
  value: string;
  unit: string;
  status: string;
  color: string;
  progress: number;
};

export type QuietZone = {
  id: string;
  name: string;
  type: string;
  address: string;
  noiseLevel: string;
  safetyRating: string;
  features: string[];
};

export type ParentInsight = {
  id: string;
  label: string;
  value: string;
  accent: string;
};

export type QuickPhrase = {
  id: string;
  label: string;
  icon: string;
};

export const SENSORY_METRICS: SensoryMetric[] = [
  {
    id: 'noise',
    title: 'Шум по маршруту',
    value: '54',
    unit: 'дБ',
    status: 'Комфортно',
    color: '#22C55E',
    progress: 0.38,
  },
  {
    id: 'crowd',
    title: 'Плотность людей',
    value: '67',
    unit: '%',
    status: 'Умеренно',
    color: '#F59E0B',
    progress: 0.67,
  },
  {
    id: 'light',
    title: 'Яркие зоны',
    value: '3',
    unit: 'уч.',
    status: 'Под контролем',
    color: '#8B5CF6',
    progress: 0.24,
  },
  {
    id: 'stress',
    title: 'Риск перегрузки',
    value: '21',
    unit: '%',
    status: 'Низкий',
    color: '#0EA5E9',
    progress: 0.21,
  },
];

export const SENSORY_LAYER_LEGEND = [
  { id: 'quiet', label: 'Тихие зоны', color: '#22C55E' },
  { id: 'noise', label: 'Шумные участки', color: '#F97316' },
  { id: 'support', label: 'Точки поддержки', color: '#8B5CF6' },
];

export const SENSORY_SUMMARY = [
  { id: 'quiet', label: 'Тихих мест рядом', value: '12', color: '#22C55E' },
  { id: 'schools', label: 'Маршрутов в школу', value: '4', color: '#0EA5E9' },
  { id: 'alerts', label: 'Шумовых предупреждений', value: '3', color: '#F97316' },
];

export const NOISE_ALERTS: NoiseAlert[] = [
  {
    id: 'noise-market',
    title: 'Шумный рынок',
    address: 'Зелёный базар, восточный вход',
    timeText: '11:05',
    level: 'high',
    levelLabel: 'Высокий шум',
    levelColor: '#DC2626',
    levelBackground: 'rgba(220, 38, 38, 0.12)',
    icon: 'volume-high-outline',
    markerColor: '#DC2626',
    markerPosition: { top: '18%', left: '21%' },
    details: 'Лучше обойти участок или включить режим коротких подсказок.',
  },
  {
    id: 'noise-crosswalk',
    title: 'Перегруженный переход',
    address: 'пр. Абылай хана, 150',
    timeText: '10:42',
    level: 'medium',
    levelLabel: 'Много людей',
    levelColor: '#F59E0B',
    levelBackground: 'rgba(245, 158, 11, 0.14)',
    icon: 'people-outline',
    markerColor: '#F59E0B',
    markerPosition: { top: '42%', left: '63%' },
    details: 'Пиковая нагрузка в обед. Спокойный обход добавит 4 минуты.',
  },
  {
    id: 'noise-avenue',
    title: 'Громкая магистраль',
    address: 'пр. Райымбека, остановка №3',
    timeText: '10:18',
    level: 'high',
    levelLabel: 'Трафик и сирены',
    levelColor: '#DC2626',
    levelBackground: 'rgba(220, 38, 38, 0.12)',
    icon: 'car-sport-outline',
    markerColor: '#EF4444',
    markerPosition: { top: '61%', left: '32%' },
    details: 'Рекомендуются наушники и переход в тихий двор через 150 метров.',
  },
  {
    id: 'noise-park',
    title: 'Спокойный участок',
    address: 'Сквер у библиотеки, северная аллея',
    timeText: '09:55',
    level: 'low',
    levelLabel: 'Тихая зона',
    levelColor: '#16A34A',
    levelBackground: 'rgba(22, 163, 74, 0.12)',
    icon: 'leaf-outline',
    markerColor: '#22C55E',
    markerPosition: { top: '74%', left: '56%' },
    details: 'Подходит для паузы, дыхания и снижения сенсорной нагрузки.',
  },
];

export const QUIET_ZONES: QuietZone[] = [
  {
    id: 'library',
    name: 'Тихий зал библиотеки',
    type: 'Библиотека',
    address: 'ул. Панфилова, 44',
    noiseLevel: '38 дБ',
    safetyRating: '4.9/5',
    features: ['вода', 'туалет', 'без очереди'],
  },
  {
    id: 'park',
    name: 'Сквер у школы',
    type: 'Парк',
    address: 'ул. Байтурсынова, 21',
    noiseLevel: '41 дБ',
    safetyRating: '4.7/5',
    features: ['лавочки', 'тень', 'короткий отдых'],
  },
  {
    id: 'clinic',
    name: 'Комната разгрузки',
    type: 'Медицинская точка',
    address: 'Поликлиника №7',
    noiseLevel: '35 дБ',
    safetyRating: '5.0/5',
    features: ['специалист', 'вода', 'тихий свет'],
  },
];

export const PARENT_INSIGHTS: ParentInsight[] = [
  { id: 'trips', label: 'Поездок за неделю', value: '8', accent: '#0EA5E9' },
  { id: 'safe', label: 'Спокойных маршрутов', value: '5', accent: '#22C55E' },
  { id: 'alerts', label: 'Риск-предупреждений', value: '3', accent: '#F97316' },
  { id: 'sos', label: 'SOS за месяц', value: '0', accent: '#DC2626' },
];

export const QUICK_PHRASES: QuickPhrase[] = [
  { id: 'parent', label: 'Мне нужен родитель', icon: 'call-outline' },
  { id: 'silence', label: 'Мне нужна тишина', icon: 'volume-mute-outline' },
  { id: 'dont-touch', label: 'Не трогайте меня', icon: 'hand-left-outline' },
  { id: 'cant-talk', label: 'Я не могу говорить', icon: 'chatbox-ellipses-outline' },
  { id: 'water', label: 'Мне нужна вода', icon: 'water-outline' },
  { id: 'safe-place', label: 'Отведите в безопасное место', icon: 'shield-checkmark-outline' },
];
