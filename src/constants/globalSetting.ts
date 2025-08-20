export const REPORT_RATE = {
  R8KHZ: 'R8KHz',
  R4KHZ: 'R4KHz',
  R2KHZ: 'R2KHz',
  R1KHZ: 'R1KHz',
  R500HZ: 'R500Hz',
  R250HZ: 'R250Hz',
  R125HZ: 'R125Hz',
};

export const REPORT_RATE_OPTIONS = [
  { value: REPORT_RATE.R8KHZ, name: 'R8KHz', label: '8KHz' },
  { value: REPORT_RATE.R4KHZ, name: 'R4KHz', label: '4KHz' },
  { value: REPORT_RATE.R2KHZ, name: 'R2KHz', label: '2KHz' },
  { value: REPORT_RATE.R1KHZ, name: 'R1KHz', label: '1KHz' },
  { value: REPORT_RATE.R500HZ, name: 'R500Hz', label: '500Hz' },
  { value: REPORT_RATE.R250HZ, name: 'R250Hz', label: '250Hz' },
  { value: REPORT_RATE.R125HZ, name: 'R125Hz', label: '125Hz' },
];

export const CONFIG_MAP = {
  Config1: 'Config1',
  Config2: 'Config2',
  Config3: 'Config3',
  Config4: 'Config4',
};

export const CONFIG_OPTIONS = [
  { value: CONFIG_MAP.Config1, name: 'Config1', label: '配置1' },
  { value: CONFIG_MAP.Config2, name: 'Config2', label: '配置2' },
  { value: CONFIG_MAP.Config3, name: 'Config3', label: '配置3' },
  { value: CONFIG_MAP.Config4, name: 'Config4', label: '配置4' },
] as any;
