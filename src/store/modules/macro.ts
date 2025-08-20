import { defineStore } from 'pinia';
import type { MacroItem, MacroDataParams, MacroDataSetParams, MacroState, MacroDataGetParams } from '@/types/macro';

import services from '@/services/index';

const state: MacroState = {
  macroData: [],
  currentMacroNum: 0,
};

export const useMacroStore = defineStore('macro', {
  state: () => state,

  actions: {
    // 获取所有的宏id
    async getMacroAllData(): Promise<void> {
      let macroCount = 0;
      const macroPromises = Array.from({ length: 16 }, async (_, i) => {
        const name = `Macro${i}`;
        const res = await services.getMacroMode({ macroId: i });
        const { actNum } = res;
        const data = [];
        const offset = Math.ceil(actNum / 15);
        macroCount += actNum;
        const dataPromises = Array.from({ length: offset }, (_, j) => this.getMacroData({ macroId: i, offset: j }));
        const results = await Promise.all(dataPromises);
        results.forEach((res) => data.push(...res.macros));
        return { name, ...res, data };
      });

      this.macroData = await Promise.all(macroPromises);
      this.currentMacroNum = macroCount;
    },

    // 获取宏模式
    async getMacroMode(macroId: number = 0): Promise<MacroItem> {
      const res = await services.getMacroMode({ macroId });
      return res;
    },

    // 设置宏模式
    async setMacroMode({ macroId, actNum, repNum, mode, valid }: MacroItem): Promise<MacroItem> {
      const res = await services.setMacroMode({ actNum, repNum, mode, macroId, valid: valid as number });
      return res;
    },

    // 获取宏数据
    async getMacroData({ macroId, offset }: MacroDataParams): Promise<MacroDataGetParams> {
      const res = await services.getMacroData({ macroId, offset });
      return res;
    },

    // 设置宏数据
    async setMacroData({ macroId, actions }: MacroDataSetParams): Promise<MacroDataGetParams[]> {
      const offset = Math.ceil(actions.length / 15);
      const promises = Array.from({ length: offset }, (_, i) =>
        services.setMacroData({
          macroId,
          offset: i,
          actions: actions.slice(i * 15, (i + 1) * 15),
        }),
      );
      return Promise.all(promises);
    },
  },
});
