import { defineStore } from 'pinia';
import type { DisplayerInfo, DisplayerState } from '@/types/displayer';

import services from '@/services/index';

const state: DisplayerState = {
  displayerInfo: {
    displayerType: 0,
    gifNum: 0,
    hasDisplay: false,
  },
};

export const useDisplayerStore = defineStore('displayer', {
  state: () => state,

  actions: {
    // 获取屏幕的信息
    async getDisplayerInfo(): Promise<DisplayerInfo> {
      const res = await services.getDisplayerInfo();
      this.displayerInfo = res;
      return res;
    },

    async updateDisplayerGIF(index: number, pictureNum: number, pictureSize: number, bin: Uint8Array[], cb) {
      await services.updateDisplayerGIF(index, pictureNum, pictureSize, bin, cb);
    },

    async setDisplayerBoot(idx: number): Promise<void> {
      await services.setDisplayerBoot(idx);
    },
  },
});
