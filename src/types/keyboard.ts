// Keyboard related types
export interface MenuClickData {
  value: string | number;
}

export interface Color {
  R: number;
  G: number;
  B: number;
  isCustom?: boolean;
}

export interface KeyboardLayoutParams {
  width: string | number;
  height: string | number;
}

export interface PerformanceData {
  isGlobalTriggering: boolean;
  globalTriggeringValue: number;
  isRt: boolean;
  isSingle: boolean;
  normalRelease: number;
  normalPress: number;
  rtFirstTouch: number;
  rtPress: number;
  rtRelease: number;
  axis: number;
  mode: number;
  pressDeadStroke: number;
  releaseDeadStroke: number;
  advancedKeyMode: number;
  calibrationData: number;
  calibrations: number;
  calibrate: number;
  travels: number;
  axisV2Id: number;
  axisRangeMax: number;
  axisCoefficient: number;
}

export interface AdvancedKeys {
  advancedType: number | string;
  value?: number;
  dks?: DksData | null;
  mpt?: MptData | null;
  mt?: MtData | null;
  tgl?: TglData | null;
  end?: EndData | null;
  socd?: SocdData | null;
  macro?: any | null;
}

export interface DksData {
  keyValue: number;
  type: 'dks';
  mode: number;
  dks: number[];
  trps: number[];
  db: number;
  db2: number;
}

export interface MptData {
  keyValue: number;
  type: 'mpt';
  mode: number;
  dks: number[];
  dbs: number[];
}

export interface MtData {
  keyValue: number;
  type: 'mt';
  mode: number;
  mt: {
    delay: number;
    dksAll: number[];
  };
}

export interface TglData {
  keyValue: number;
  type: 'tgl';
  mode: number;
  tgl: {
    kc: number[];
    delay: number;
  };
}

export interface EndData {
  keyValue: number;
  type: 'end';
  mode: number;
  end: {
    dks: number[];
    delay: number;
  };
}

export interface SocdData {
  keyValue: number;
  type: 'socd';
  mode: number;
  socdMode: number;
  socd: {
    // row: number;
    // col: number;
    row2: number;
    col2: number;
    socdMode: number;
    delay: number;
    kcs: number[];
  };
}

export interface RsData {
  keyValue: number;
  type: 'rs';
  mode: number;
  rs: number[];
}

export interface KeyboardItemInfo {
  col: number;
  row: number;
  keyValue: number;
  customLight: Color;
  performance: PerformanceData;
  advancedKeys: AdvancedKeys;
  customKeys: {
    win: {
      fn0: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
      fn1: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
      fn2: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
      fn3: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
    };
    mac: {
      fn0: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
      fn1: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
      fn2: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
      fn3: { keyValue: number; bindKeyValue: number; defaultKeycode: number };
    };
  };
}

export interface SystemItem {
  name: string;
  value: 'WIN' | 'MAC';
}

export interface RatioValue {
  w: number;
  h: number;
  w2?: number;
  h2?: number;
  x?: number;
  x2?: number;
}
export type RatioKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface KeyLayoutStyleItem {
  col: number;
  row: number;
  ratio: number;
  ratioValue?: number;
  spaceWidth?: number;
  isSpaceWidthStyle: boolean;
}

export interface LegendItem {
  value: string;
  style: {
    color: string;
    fontSize: string;
  };
}

export interface Legend {
  left: LegendItem;
  center: LegendItem;
  right: LegendItem;
}

export interface LayoutItem {
  shapeScale: { w: number; h: number };
  location: { x: number; y: number; row?: number; col?: number };
  legendTop?: Legend;
  legendCenter?: Legend;
  legendBottom?: Legend;
  legendFont?: Legend;
  // 其他可能的字段
}

export interface KeyboardLayoutItem {
  shapeScale: {
    w: number;
    h: number;
    w2?: number;
    h2?: number;
  };
  location: {
    row: number;
    col: number;
  };
  colIndex: number;
  rowIndex: number;
  isSpaceWidthStyle: boolean;
}

export interface Area {
  rows: number;
  cols: number;
}

export interface KeyColorResult {
  color: string;
  isCustom: boolean;
  brightness: number;
  fontColor: string;
}

export interface DropParams {
  row: number;
  col: number;
}

export interface ShapeComputed {
  shapeWidth: number;
  shapeHeight: number;
  contentWidth: number;
  contentHeight: number;
  shapeWidth2: number;
  shapeHeight2: number;
}

export interface LocationComputed {
  x: number;
  y: number;
  top: number;
  left: number;
  keyBorderTop: number;
  keyBorderLeft: number;
  x2: number;
  y2: number;
  top2: number;
  left2: number;
  keyBorderTop2: number;
  keyBorderLeft2: number;
}

export interface KeyStyle {
  top: string;
  left: string;
  width: string;
  height: string;
  borderWidth?: string;
  borderRadius?: string;
  zIndex?: number;
  [key: string]: string | number | undefined;
}

export interface CalibrationStatus {
  color: string;
  text: string;
}

export interface AxisValue {
  axis_name: string;
  axis_color: string;
  doctrine_range_right?: number;
  doctrine_range_left?: number;
}

export interface SetKeyLayoutParams {
  layer: number;
  row: number;
  col: number;
  keycode: number;
}

export interface GetKeyCodeParams {
  layer: number;
  row: number;
  col: number;
}

export interface KeyPosition {
  row: number;
  col: number;
}

export interface IKeyDefaultKeyLayout {
  fn: number;
  system: number;
  row: number;
}

export interface GetKeyLayoutParams {
  layer: number;
}

export interface KeyboardState {
  fnLayer: number;
  system: number;
  keyLayoutConfig: {
    row: number;
    col: number;
  };
  keyLayoutStyle: any[];
  keyboardLayout: KeyboardItemInfo[][];
  activeKeys: string[];
  inChangLight: boolean;
  selectKey: {
    row: number | null;
    col: number | null;
    keycode: number | null;
  };
}

export interface PerformanceState {
  calibrationStatus: Record<number, Record<number, number>>;
  axisList: Record<
    number,
    {
      axis_name: string;
      axis_color: string;
      doctrine_range_right?: number;
      doctrine_range_left?: number;
    }
  >;
}

export interface LightingState {
  colorPickerPanel: Color;
}
