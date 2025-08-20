import type { Color } from '@/types/interface';

export interface LightInfo {
  open: boolean;
  mode: number;
  staticColors: string[];
  selectStaticColor: number;
  luminance: number;
  speed: number;
  sleepTime: number;
  direction: boolean;
  dynamic: number;
  isOpen?: boolean;
}

export interface LightingState {
  area: string;
  base: string;
  currentColor: string;
  palette: string;
  colorCorrection: string;
  light: LightInfo;
  enterCustom: boolean;
  // keyColors: Record<string, any>; //  TypeScript 中的一个工具类型，它表示一个对象类型，string是键 any是值
  lightingAreaList: any[];
  lightingLibraryList: any[];
  saturation: Color;
  colorPickerPanel: Color;
  syncLighting: boolean;
  lightingAreaIndex: number;
  lightingDynamicRender: boolean;
  lightingDecorate: Color[][];
  upOpen: boolean;
  downOpen: boolean;
  contextMenuVisible: boolean;
  lamp: 'SingleLighting' | 'DoubleLighting'; // 灯光类型
  openState: 'Open' | 'Close' | 'OpenUp' | 'OpenDown'; // 灯光开关状态
}

export interface Decorate1Params {
  rows: number;
  cols: number;
  index: number;
}

export interface LightingBaseParams {
  open: string;
  mode: number;
  luminance: number;
  speed: number;
  direction: string;
  selectStaticColor: number;
}

export interface LightingPalette {
  staticColors: Color[];
}
export interface LightingSwitchState {
  open: 'Open' | 'Close' | 'OpenUp' | 'OpenDown';
}
export interface LightingBaseResult {
  direction: 'Forward' | 'Backward';
  luminance: number;
  mode: number;
  open: LightingSwitchState;
  selectStaticColor: number;
  speed: number;
}
