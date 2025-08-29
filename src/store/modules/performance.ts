import { defineStore } from 'pinia';

// import axisInfoList from '@/configs/axis/index.json';

import { useKeyboardStore } from './keyboard';
import { useDeviceStore } from './device';
import type { KeyboardItemInfo } from '@/types/keyboard';
import type { PerformanceState, KeyPerformance, KeyPosition, IPerformanceData } from '@/types/performance';
import services from '@/services/index';
import { httpService } from '@/http/api/index.js';

const state: PerformanceState = {
  axisList: [],
  allAxisList: [],
  allAxisListV2: [],
  calibrations: [],
  isCalibrating: false, // 添加校准状态标志
  performanceTab: 0,
  isAxisStatus: 'v1',
  // globalTouchTravel: 1.5, // 全局触发行程
  // precision: 0.1, // 键盘行程精度
  // decimalPlace: 2, // 行程显示的小数位
  // minTouchTravel: 0.1, // 最小触发行程
  // maxTouchTravel: 4.0, // 最大触发行程
  // singleTouchTravel: 1.5, // 单键触发行程
  // singleTouchRelease: 1.5, // 单键释放行程
  // quickTouchPress: 0.3, // 快速触发按下行程
  // quickTouchRelease: 0.3, // 快速触发抬起行程
  // pressDead: 0.2, // 按压死区
  // releaseDead: 0.2, // 抬起死区
  // globalTouchPressDead: 0.2, // 全局按压死区
  // globalTouchReleaseDead: 0.2, // 全局抬起死区
  // performanceData: [],
};

export const usePerformanceStore = defineStore('performance', {
  state: () => state,
  getters: {
    // 计算当前Axis的分组
    getCurrentAxisGroup: () => {
      // 通过axisSortList排序
      return [
        { type: 'GATERON', name: '佳达隆' },
        { type: 'TTC', name: 'TTC' },
        { type: 'other', name: '其他' },
      ];
    },
  },

  actions: {
    async getPerformance(keyboard: KeyboardItemInfo[]): Promise<KeyPerformance[]> {
      const performance: Promise<KeyPerformance>[] = [];
      for (let colIdx = 0; colIdx < keyboard.length; colIdx++) {
        const { row, col, keyValue } = keyboard[colIdx];
        const KeyPerformance: KeyPerformance = {
          row,
          col,
          mode: 0,
          keyValue,
          singleTriggeringValue: 0,
          // normalRelease: 0,
          rtFirstTouch: 0,
          rtPressValue: 0,
          rtReleaseValue: 0,
          deadBandPressValue: 0,
          deadBandReleaseValue: 0,
          calibrations: 0,
          travels: 0,
          axisV2Id: 0,
          axisRangeMax: 0,
          axisCoefficient: 0,
        };
        if (keyValue === 0) continue;
        performance.push(this.getPerformanceValue({ row, col }, KeyPerformance));
      }
      const result = await Promise.all(performance);
      return result;
    },

    async getPerformanceValue(params: KeyPosition, performance: KeyPerformance): Promise<KeyPerformance> {
      const performanceResult = await services.getPerformance(params);
      if (params.row === 1 && params.col === 0) {
        console.log('performanceResult', performanceResult);
      }
      if (performanceResult) {
        const {
          mode,
          normalPress,
          // normalRelease,
          rtFirstTouch,
          rtPress,
          rtRelease,
          pressDeadStroke,
          releaseDeadStroke,
          axis,
          calibrate,
          // 轴体相关的
          axisV2Id,
          axisRangeMax,
          axisCoefficient,
        } = performanceResult as IPerformanceData;
        // 设置当前键盘的性能模式
        performance.mode = mode;
        performance.normalPress = normalPress;
        // performance.normalRelease = normalRelease;
        performance.rtFirstTouch = rtFirstTouch;
        performance.rtPress = rtPress;
        performance.rtRelease = rtRelease;
        performance.pressDeadStroke = pressDeadStroke;
        performance.releaseDeadStroke = releaseDeadStroke;
        performance.axis = axis;
        performance.calibrate = calibrate;
        performance.axisV2Id = axisV2Id;
        performance.axisRangeMax = axisRangeMax;
        performance.axisCoefficient = axisCoefficient;
      }

      return performance;
    },

    async setPerformance(performanceItem: IPerformanceData): Promise<any> {
      // const performance = this.performanceData[row][col];
      // TODO:v2新增轴体的判断
      const result = await services.setPerformance({ ...performanceItem, calibrate: 0 });
      return result;
    },

    async getAxisList(): Promise<void> {
      const deviceStore = useDeviceStore();
      const list = await this.getAxisVersion();
      if (this.isAxisStatus === 'v1') {
        const res = await httpService.getAxisList({ t: Date.now() });
        this.allAxisList = res;
        list.forEach((item: number, itemIndex: number) => {
          const index = this.allAxisList.findIndex((axis: any) => axis.axis_id === item);
          if (index !== -1) {
            const axisItem = this.allAxisList[index];
            this.axisList.push({ ...axisItem, axisIndex: itemIndex });
          }
        });
      } else {
        const boardId = deviceStore.info?.boardId.toString(16).padStart(8, '0');
        const vid = deviceStore.device?.vendorId.toString(16).padStart(4, '0');
        const pid = deviceStore.device?.productId.toString(16).padStart(4, '0');
        const params = { board_id: boardId, vid, pid, t: Date.now() };
        const resV2 = await httpService.getAxisListV2(params);
        this.allAxisListV2 = resV2;
        this.allAxisListV2.forEach((axisItem: object, itemIndex: number) => {
          this.axisList.push({ ...axisItem, axisIndex: itemIndex });
        });
      }
    },

    async getAxisVersion(): Promise<number[]> {
      const result = await services.getAxisList();
      console.log('result', result);
      const { list } = result;
      // TODO：根据list 查询allAxisList 中是否存在 按顺序显示
      this.isAxisStatus = list.length === 0 ? 'v2' : 'v1';
      return this.isAxisStatus === 'v1' ? list : [];
    },

    async calibrationStart(): Promise<any> {
      this.isCalibrating = true;
      const result = await services.calibrationStart();
      return result;
    },

    async calibrationEnd(): Promise<any> {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      this.isCalibrating = false;
      const result = await services.calibrationEnd();
      for (let row = 0; row < keyboardLayout.value.length; row++) {
        for (let col = 0; col < keyboardLayout.value[row].length; col++) {
          if (keyboardLayout.value[row][col].performance.calibrate === 2) {
            keyboardLayout.value[row][col].performance.calibrate = 1;
          }
        }
      }
      return result;
    },

    async getRm6X21Calibration(): Promise<{ max: number }> {
      if (!this.isCalibrating) return { max: 0 }; // 如果不在校准状态，直接返回
      // console.log('xxxxxgetRm6X21Calibration', this.isCalibrating);
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const sample: number[][] = [];
      const travels: number[][] = [];
      const calibrationStatus: number[][] = [];
      const rowCount = keyboardLayout.value.length;

      const tasks = Array.from({ length: rowCount }, (_, i) => {
        return Promise.all([
          services.getADCSample({ row: i }),
          services.getRoute({ row: i }),
          services.getCalibrationStatus({ row: i }),
        ]);
      });
      const results = await Promise.all(tasks);
      for (let i = 0; i < rowCount; i++) {
        const [sampleRes, routeRes, statusRes] = results[i];
        sample.push(sampleRes.data);
        travels.push(routeRes.data);
        calibrationStatus.push(statusRes.data);
      }
      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < keyboardLayout.value[row].length; col++) {
          const key = keyboardLayout.value[row][col].performance;
          key.calibrations = sample[row][col];
          key.calibrate = calibrationStatus[row][col];
          key.travels = travels[row][col];
        }
      }

      const { max } = this.getMaxPressTravel([], travels);
      console.log('max', max);
      return { max: max / 1000 };
    },

    // 单键解最大值
    getMaxPressTravel(status: number[][], travels: number[][]): { max: number; press: number } {
      let max = 0;
      let press = 0;
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 21; j++) {
          if (max < travels[i][j]) {
            max = travels[i][j];
            if (status.length > 0) press = status[i][j];
          }
        }
      }
      return { max, press };
    },
  },
});
