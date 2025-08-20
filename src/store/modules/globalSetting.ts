import { defineStore } from 'pinia';

import { GlobalFeatureRateOfReturnType } from '@sparklinkplayjoy/sdk-keyboard-v2';
import services from '@/services/index';
import { useKeyboardStore } from './keyboard';

interface Area {
  index: number;
  count: number;
  rows: number;
  cols: number;
}

interface LightingArea {
  total: number;
  areas: Area[];
}

interface GlobalState {
  system: string;
  configList: string[];
  currentConfig: string | null;
  rtPrecision: number;
  lightingSleepTime: number;
  islightingArea: boolean;
  isDoubleLighting: boolean;
  lightingAreaTotal: number | null;
  lightingArea: Area[];
  specialLighting: number;
  configNames: string[];
  isNoConfigRename: boolean;
  lightingLinkState: boolean;
  spaceIndex: {
    row: number;
    col: number;
  };
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({
    system: 'WIN',
    configList: [],
    currentConfig: null,
    rtPrecision: 1,
    lightingSleepTime: 0,
    // 灯光区域
    islightingArea: false,
    isDoubleLighting: false,
    lightingAreaTotal: null,
    lightingArea: [],
    specialLighting: 1,
    configNames: [],
    isNoConfigRename: true,
    lightingLinkState: false,
    spaceIndex: {
      row: 0,
      col: 0,
    },
  }),

  actions: {
    async restoreFactory(): Promise<any> {
      const res = await services.GFSRestore('All');
      return res;
    },

    async getSystem(): Promise<void> {
      const res = await services.getSystemType();
      this.system = res.key;
    },

    async setSystem(systemType?: string): Promise<any> {
      const system = this.system === 'MAC' ? 'win' : 'mac';
      const keyboardStore = useKeyboardStore();
      const res = await services.setSystemType(systemType || this.system);
      await Promise.all(
        keyboardStore.keyboardLayout.map(async (row, rowIndex) => {
          await Promise.all(
            row.map(async (col, colIndex) => {
              // if (keyboardStore.keyboardLayout[rowIndex][colIndex].keyValue > 0) {
              await Promise.all(
                [0, 1, 2, 3].map(async (layer) => {
                  const res = await keyboardStore.getKeyCode({ layer, row: rowIndex, col: colIndex });
                  const keycode = (res as any)?.keycode || res;
                  if (keycode !== -1) {
                    keyboardStore.keyboardLayout[rowIndex][colIndex].customKeys[system][`fn${layer}`].bindKeyValue =
                      keycode;
                  }
                }),
              );
              // }
            }),
          );
        }),
      );
      return res;
    },

    async getConfigList(): Promise<void> {
      const res = await services.getConfigList();
      this.configList = res.list;
    },

    async getConfigName(index: number): Promise<string> {
      const res = await services.getConfigName(index);
      return res;
    },

    async getLightingSleepTime(): Promise<void> {
      const res = await services.getLightingSleepTime();
      this.lightingSleepTime = res;
    },
    async setLightingSleepTime(time: number): Promise<void> {
      await services.setLightingSleepTime(time);
    },

    async setConfigName(index: number, name: string): Promise<void> {
      await services.setConfigName(index, name);
    },

    async getCurrentConfig(): Promise<void> {
      const res = await services.getConfig();
      this.currentConfig = res.key;
    },

    async getRtPrecision(): Promise<any> {
      const res = await services.getRtPrecision();
      this.rtPrecision = Number(res.min) as number;
      return res.min;
    },

    async setConfig(): Promise<void> {
      await services.setConfig(this.currentConfig);
    },

    updateCurrentConfig(value: string): void {
      this.currentConfig = value;
    },

    updateSystem(system: string): void {
      this.system = system;
    },

    // 灯光区域获取
    async getLightingArea(): Promise<LightingArea> {
      const lightingArea = await services.getLightingArea();
      const { total, areas } = lightingArea as { total: number; areas: Area[] };
      if (!this.islightingArea) this.islightingArea = true;
      this.lightingAreaTotal = total;
      this.lightingArea = areas;
      return lightingArea as LightingArea;
    },

    // 双灯位获取
    async getDoubleLighting(): Promise<number | null> {
      const doubleLightingRes = await services.getDoubleLighting();
      const { doubleLighting } = doubleLightingRes;
      if (doubleLighting) this.isDoubleLighting = true;
      return doubleLighting;
    },

    // 特殊灯获取
    async getSpecialLighting(): Promise<void> {
      // console.log('getLightingAreagetLightingArea');
      const specialLightingRes = await services.getSpecialLighting();
      this.specialLighting = specialLightingRes.specialLighting;
      // TODO: Implement special lighting logic
    },

    // 回报率查询
    async getRateOfReturnList() {
      const res = await services.getRateOfReturnList();
      return res.list.map((rate, index) => ({ label: rate.replace('R', ''), value: index, key: rate }));
    },

    async getRateOfReturn() {
      const { value } = (await services.getRateOfReturn()) as { value: number };
      return value;
    },
    // 回报率设置

    setRateOfReturn(value: GlobalFeatureRateOfReturnType) {
      return services.setRateOfReturn(value);
    },
  },
});
