export interface DisplayerInfo {
  displayerType: number;
  gifNum: number;
  hasDisplay: boolean;
}

export interface DisplayerState {
  displayerInfo: DisplayerInfo;
}

export interface IFlashParams {
  address: number;
  data: Uint8Array;
  size?: number;
}
