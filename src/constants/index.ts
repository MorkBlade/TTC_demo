export * from './lighting';
export * from './keyboard';
export * from './performance';
export * from './globalSetting';
export * from './higherKey';
export const MENUS_MAP = {
  LIGHTING: 'Lighting',
  CUSTOMKEY: 'CustomKey',
  PERFORMANCE: 'Performance',
  HIGHERKEY: 'HigherKey',
  MACRO: 'Macro',
  CALIBRATION: 'Calibration',
};
export const MENUS = [
  { name: MENUS_MAP.LIGHTING, title: '灯光配置', id: 1 },
  { name: MENUS_MAP.CUSTOMKEY, title: '自定义按键', id: 2 },
  { name: MENUS_MAP.PERFORMANCE, title: '性能配置', id: 3 },
  { name: MENUS_MAP.HIGHERKEY, title: '高级键', id: 4 },
  { name: MENUS_MAP.MACRO, title: '宏管理', id: 5 },
  { name: MENUS_MAP.CALIBRATION, title: '键盘校准', id: 6 },
];
