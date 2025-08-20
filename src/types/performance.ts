export interface AxisItem {
  axis_id: number;
  axis_name: string;
  drive_range: string;
  doctrine_range_left: string;
  doctrine_range_right: string;
  factory_name: string;
  axis_color: string;
  image_url: string;
  created_at: string;
  axis_range_max: number;
  magnetic_flux: number;
  axisIndex: number;
  brand: string;
  aixsDetail: {
    axis_id: number;
    axis_range_max: number;
    axis_coefficient: number;
  }[];
}

export interface PerformanceState {
  // globalTouchTravel: number;
  // precision: number;
  // decimalPlace: number;
  // minTouchTravel: number;
  // maxTouchTravel: number;
  // singleTouchTravel: number;
  // singleTouchRelease: number;
  // quickTouchPress: number;
  // quickTouchRelease: number;
  // pressDead: number;
  // releaseDead: number;
  // globalTouchPressDead: number;
  // globalTouchReleaseDead: number;
  axisList: AxisItem[];
  allAxisList: AxisItem[];
  calibrations: number[][];
  isCalibrating: boolean;
  performanceTab: number;
  isAxisStatus: string;
  allAxisListV2: AxisItem[];
}

export interface KeyPerformance {
  row: number;
  col: number;
  mode: number;
  keyValue: number;
  singleTriggeringValue: number;
  rtFirstTouch: number;
  rtPressValue: number;
  rtReleaseValue: number;
  deadBandPressValue: number;
  deadBandReleaseValue: number;

  calibrations: number;
  travels: number;
  normalPress?: number;
  normalRelease?: number;
  pressDeadStroke?: number;
  releaseDeadStroke?: number;
  axis?: number;
  calibrate?: number;
  rtPress?: number;
  rtRelease?: number;
  // 轴体相关的
  axisV2Id: number;
  axisRangeMax: number;
  axisCoefficient: number;
}

export interface KeyPosition {
  row: number;
  col: number;
}

export interface IPerformanceData {
  row: number;
  col: number;
  mode: number; // 触发方式
  normalPress: number; // 普通触发按下行程
  normalRelease: number; // 普通触发释放行程
  rtFirstTouch: number; // RT触发首次触发行程
  rtPress: number; // RT首次触发按下行程
  rtRelease: number; // RT首次触发释放行程
  pressDeadStroke: number; // 按下死区
  releaseDeadStroke: number; // 抬起死区
  axis: number; // 轴体
  calibrate: number; // 校准标志
  // 轴体相关的
  axisV2Id: number;
  axisRangeMax: number;
  axisCoefficient: number;
}
