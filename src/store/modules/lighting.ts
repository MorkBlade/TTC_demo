import { defineStore } from 'pinia';
import type { Color } from '@/types/interface';
import type {
  LightingState,
  LightingPalette,
  Decorate1Params,
  LightingBaseParams,
  LightingBaseResult,
} from '@/types/lighting';

import services from '@/services/index';

const state: LightingState = {
  area: 'Keyboard',
  base: 'Base',
  currentColor: '',
  palette: 'Palette',
  colorCorrection: 'ColorCorrection',
  light: {
    open: false,
    mode: 0, // 0-19动态 20静态
    staticColors: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    selectStaticColor: 0,
    luminance: 50,
    speed: 1,
    sleepTime: -1,
    direction: false,
    dynamic: 1, // 动态灯效index 用于匹配选中项
  },
  enterCustom: false, // 是否在自定义灯光页面
  // keyColors: {},
  lightingAreaList: [],
  lightingLibraryList: [],
  saturation: { R: 255, G: 255, B: 255 },
  // 灯效的颜色
  colorPickerPanel: { R: 255, G: 255, B: 255 },

  // TODO:当开启灯效同步的时候不能自定义灯效设置要不然会出现问题

  // 灯效同步
  syncLighting: false,
  // 灯效的区域下标
  lightingAreaIndex: 0,
  lightingDynamicRender: false,
  lightingDecorate: [],
  upOpen: false,
  downOpen: false,
  contextMenuVisible: false,
  lamp: 'SingleLighting', // 灯光类型
  openState: 'Open', // 灯光开关状态
};

export const useLightingStore = defineStore('lighting', {
  state: () => state,
  getters: {
    getCurrentLightingLamp: (state) => state.lamp,
    // 当前的灯位的状态
    getCurrentLightingStatus: (state) => {
      // 判断当前的灯位是单灯位还是双灯位
      if (state.lamp === 'SingleLighting') return state.light.open ? 'Open' : 'Close';
      if (state.upOpen && state.downOpen) return 'Open';
      if (state.upOpen) return 'OpenUp';
      if (state.downOpen) return 'OpenDown';
      return 'Close';
    },
  },
  actions: {
    // 获取灯光的基础信息
    async getLightingBase(
      lampData: 'SingleLighting' | 'DoubleLighting' = 'SingleLighting',
    ): Promise<LightingBaseResult> {
      const lamp = this.area === 'Keyboard' ? lampData : 'SingleLighting';
      this.lamp = lamp;
      const res = await services.getLightingBase({ area: this.area, config: this.base }, lamp);
      this.updateLightingBaseData(res);
      return res;
    },

    // 设置灯光的基础信息
    async setLightingBase(
      openState?: 'Open' | 'Close' | 'OpenUp' | 'OpenDown',
      lampValue?: 'SingleLighting' | 'DoubleLighting',
    ): Promise<LightingBaseResult> {
      let open: 'Open' | 'Close' | 'OpenUp' | 'OpenDown';
      let lamp: 'SingleLighting' | 'DoubleLighting';
      if (openState) {
        open = openState;
      } else {
        open = this.light.open ? 'Open' : 'Close';
      }
      if (lampValue) {
        lamp = lampValue;
      } else {
        lamp = this.lamp;
      }
      const res = await services.setLightingBase({
        area: this.area,
        config: this.base,
        data: {
          open,
          mode: this.light.mode,
          luminance: this.light.luminance,
          speed: this.light.speed,
          direction: this.light.direction ? 'Forward' : 'Backward',
          selectStaticColor: this.light.selectStaticColor,
        },
        lamp,
      });

      return res as unknown as LightingBaseResult;
    },

    // 获取调色盘
    async getLightingPalette(): Promise<string[]> {
      const res = (await services.getLightingPalette({ area: this.area, config: this.palette })) as LightingPalette;
      const staticColors = res.staticColors.map((item: Color) => {
        return `#${item.R.toString(16).padStart(2, '0')}${item.G.toString(16).padStart(2, '0')}${item.B.toString(16).padStart(2, '0')}`;
      });
      this.light.staticColors = staticColors;
      return staticColors;
    },

    // 设置调色盘
    async setLightingPalette(): Promise<string[]> {
      const staticColors = this.light.staticColors.map((item: string) => {
        const [R, G, B] = item
          .slice(1)
          .match(/.{2}/g)
          .map((hex: string) => parseInt(hex, 16));
        return { R, G, B };
      });
      const res = (await services.setLightingPalette({
        area: this.area,
        config: this.palette,
        data: { staticColors },
      })) as unknown as string[];
      return res;
    },

    // 获取灯光饱和度
    async getLightingColorCorrection(): Promise<Color> {
      const res = (await services.getLightingColorCorrection({
        area: this.area,
        config: this.colorCorrection,
      })) as Color;
      const { R, G, B } = res;
      this.saturation = { R, G, B };
      return res;
    },

    // 设置灯光饱和度
    async setLightingColorCorrection(): Promise<Color> {
      const res = (await services.setLightingColorCorrection({
        area: this.area,
        config: this.colorCorrection,
        data: this.saturation,
      })) as Color;
      return res;
    },

    // 设置灯效库的数据
    updateLightingBaseData(data: LightingBaseParams): void {
      // 单灯位使用的open的变量 双灯位使用的是upOpen、downOpen 全开是用open
      const { open, mode, luminance, speed, direction, selectStaticColor } = data;
      this.light.open = open === 'Open';
      this.light.mode = mode;
      this.light.luminance = luminance;
      this.light.speed = speed;
      this.light.direction = direction === 'Forward';
      this.light.selectStaticColor = selectStaticColor;
      if (open === 'Open') {
        this.upOpen = true;
        this.downOpen = true;
      } else if (open === 'OpenUp') {
        this.upOpen = true;
        this.downOpen = false;
      } else if (open === 'OpenDown') {
        this.downOpen = true;
        this.upOpen = false;
      } else {
        this.upOpen = false;
        this.downOpen = false;
      }
    },

    updateArea(area: string): void {
      this.area = area;
    },

    updateSwitch(open: boolean): void {
      this.light.open = open;
    },

    updateDynamicRender(isRender: boolean): void {
      this.lightingDynamicRender = isRender;
    },

    updateMode(mode: number): void {
      this.light.mode = mode;
    },

    updateLuminance(luminance: number): void {
      this.light.luminance = luminance;
    },

    updateSpeed(speed: number): void {
      this.light.speed = speed;
    },

    updateDirection(direction: boolean): void {
      this.light.direction = direction;
    },

    updateSelectStaticColor(colorIndex: number): void {
      this.light.selectStaticColor = colorIndex;
    },

    updateEnterCustom(flag: boolean): void {
      this.enterCustom = flag;
    },

    async getDecorateColor({ rows, cols, index }: Decorate1Params): Promise<void> {
      const obj = {
        0: 'Keyboard',
        1: 'Decorate1',
        2: 'Decorate2',
        3: 'Decorate3',
        4: 'Decorate4',
        5: 'Decorate5',
      };
      const area = obj[index] ? obj[index] : 'Decorate1';
      const res = await services.getDecorate1Custom({ rows, cols, area });
      if (res && Array.isArray(res)) {
        for (let row = 0; row < res.length; row++) {
          if (this.lightingDecorate[row] === undefined) this.lightingDecorate[row] = [];
          for (let col = 0; col < res[row].length; col++) {
            this.lightingDecorate[row][col] = res[row][col];
          }
        }
      }
    },

    async setDecorateColor(rowIndex: number, colIndex: number, color: Color, isCustom: boolean): Promise<void> {
      this.lightingDecorate[rowIndex][colIndex].R = color.R;
      this.lightingDecorate[rowIndex][colIndex].G = color.G;
      this.lightingDecorate[rowIndex][colIndex].B = color.B;
      this.lightingDecorate[rowIndex][colIndex].isCustom = isCustom;
      await this.debouncedSetLightingCustom();
    },

    async setDecorateColorAll(): Promise<void> {
      this.lightingDecorate.forEach((row) => {
        row.forEach((col) => {
          col.isCustom = false;
        });
      });
      await this.debouncedSetLightingCustom();
    },

    async debouncedSetLightingCustom(): Promise<void> {
      await services.setDecorate1Custom({
        area: this.area,
        protocol: 'Custom',
        data: this.lightingDecorate[0],
      });
    },
  },
});
