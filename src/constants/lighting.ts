export const KEYBOARD_AREA = {
  KYEBOARD: 1,
  DECORATE: 2,
};

export const KEYBOARD_AREA_OPTIONS = [
  { value: KEYBOARD_AREA.KYEBOARD, name: 'Keyboard', label: '主键盘灯' },
  { value: KEYBOARD_AREA.DECORATE, name: 'Decorate', label: '装饰灯' },
];

// 灯效类型
export const LIGHTING_TYPES = {
  STATIC: 0,
  DYNAMIC: 1,
  CUSTOME: 2,
};

export const LIGHTING_TYPES_OPTIONS = [
  { value: LIGHTING_TYPES.STATIC, name: 'Static', label: '静态' },
  { value: LIGHTING_TYPES.DYNAMIC, name: 'Dynamic', label: '动态' },
  { value: LIGHTING_TYPES.CUSTOME, name: 'Custom', label: '自定义' },
];

// 方向
export const LIGHTING_DIRECTION = {
  FORWARD: 0,
  BACKWARD: 1,
};

export const LIGHTING_DIRECTION_OPTIONS = [
  { value: LIGHTING_DIRECTION.FORWARD, name: 'Forward', label: '静态' },
  { value: LIGHTING_DIRECTION.BACKWARD, name: 'Backward', label: '动态' },
];

// 休眠
export const LIGHTING_SLEEP = {
  MIN0: 0,
  MIN1: 1,
  MIN2: 2,
  MIN3: 3,
  MIN5: 5,
  MIN10: 10,
  MIN15: 15,
  MIN20: 20,
  MIN25: 25,
  MIN30: 30,
  MIN45: 45,
  MIN60: 60,
  MIN120: 120,
};
export const LIGHTING_SLEEP_OPTIONS = [
  { value: LIGHTING_SLEEP.MIN0, name: 'Min0', label: '永不' },
  { value: LIGHTING_SLEEP.MIN1, name: 'Min1', label: '1分钟' },
  { value: LIGHTING_SLEEP.MIN2, name: 'Min2', label: '2分钟' },
  { value: LIGHTING_SLEEP.MIN3, name: 'Min3', label: '3分钟' },
  { value: LIGHTING_SLEEP.MIN5, name: 'Min5', label: '5分钟' },
  { value: LIGHTING_SLEEP.MIN10, name: 'Min10', label: '10分钟' },
  { value: LIGHTING_SLEEP.MIN15, name: 'Min15', label: '15分钟' },
  { value: LIGHTING_SLEEP.MIN20, name: 'Min20', label: '20分钟' },
  { value: LIGHTING_SLEEP.MIN25, name: 'Min25', label: '25分钟' },
  { value: LIGHTING_SLEEP.MIN30, name: 'Min30', label: '30分钟' },
  { value: LIGHTING_SLEEP.MIN45, name: 'Min45', label: '45分钟' },
  { value: LIGHTING_SLEEP.MIN60, name: 'Min60', label: '60分钟' },
  { value: LIGHTING_SLEEP.MIN120, name: 'Min120', label: '120分钟' },
];

// 动态灯效
export const LIGHTING_DYNAMIC = {
  RIPPLE: 1, // 波纹荡漾 RIPPLE
  EBBANDFLOW: 2, // 潮起潮落 EBBANDFLOW
  RIPPLEGENTLY: 3, // 涟漪轻漾 RIPPLEGENTLY
  ROTATINGSTORM: 4, // 旋转风暴 ROTATINGSTORM
  LUCKYRAINBOW: 5, // 幸运彩虹 LUCKYRAINBOW
  SHININGRAINBOW: 6, // 闪耀彩虹 SHININGRAINBOW
  SHINING: 7, // 熠熠生辉 SHINING
  MOVINGWINDOW: 8, // 移动窗格 MOVINGWINDOW
  WAVETRANSFORMATION: 9, // 波形变换 WAVETRANSFORMATION
  JUMP: 10, // 跃动不息 JUMP
  SHIFT: 11, // 移形换影 SHIFT
  SINECURVE: 12, // 正弦曲线 SINECURVE
  CLOUDFLOW: 13, // 行云流水 CLOUDFLOW
  BLOOMING: 14, // 百花争艳 BLOOMING
  RAINBOW: 15, // 斑斓镶嵌 RAINBOW
  RAINFALL: 16, // 雨落如注 RAINFALL
};

export const LIGHTING_DYNAMIC_OPTIONS = [
  { value: LIGHTING_DYNAMIC.RIPPLE, name: 'Ripple', label: '波纹荡漾' },
  { value: LIGHTING_DYNAMIC.EBBANDFLOW, name: 'EbBandFlow', label: '潮起潮落' },
  { value: LIGHTING_DYNAMIC.RIPPLEGENTLY, name: 'RippleGently', label: '涟漪轻漾' },
  { value: LIGHTING_DYNAMIC.ROTATINGSTORM, name: 'RotatingStorm', label: '旋转风暴' },
  { value: LIGHTING_DYNAMIC.LUCKYRAINBOW, name: 'LuckyRainbow', label: '幸运彩虹' },
  { value: LIGHTING_DYNAMIC.SHININGRAINBOW, name: 'ShiningRainbow', label: '闪耀彩虹' },
  { value: LIGHTING_DYNAMIC.SHINING, name: 'Shining', label: '熠熠生辉' },
  { value: LIGHTING_DYNAMIC.MOVINGWINDOW, name: 'MovingWindow', label: '移动窗格' },
  { value: LIGHTING_DYNAMIC.WAVETRANSFORMATION, name: 'WaveTransformation', label: '波形变换' },
  { value: LIGHTING_DYNAMIC.JUMP, name: 'Jump', label: '跃动不息' },
  { value: LIGHTING_DYNAMIC.SHIFT, name: 'Shift', label: '移形换影' },
  { value: LIGHTING_DYNAMIC.SINECURVE, name: 'SineCurve', label: '正弦曲线' },
  { value: LIGHTING_DYNAMIC.CLOUDFLOW, name: 'CloudFlow', label: '行云流水' },
  { value: LIGHTING_DYNAMIC.BLOOMING, name: 'Blooming', label: '百花争艳' },
  { value: LIGHTING_DYNAMIC.RAINBOW, name: 'Rainbow', label: '斑斓镶嵌' },
  { value: LIGHTING_DYNAMIC.RAINFALL, name: 'Rainfall', label: '雨落如注' },
];

export const LIGHTING_STATIC_COLOR = [
  { value: 0, name: 'color0', label: '彩色' },
  { value: 1, name: 'color1', label: '颜色1' },
  { value: 2, name: 'color2', label: '颜色2' },
  { value: 3, name: 'color3', label: '颜色3' },
  { value: 4, name: 'color4', label: '颜色4' },
  { value: 5, name: 'color5', label: '颜色5' },
  { value: 6, name: 'color6', label: '颜色6' },
  { value: 7, name: 'color7', label: '颜色7' },
];
