import { defineStore, storeToRefs } from 'pinia';

import services from '@/services/index';
import { useKeyboardStore } from './keyboard';
import type { DksData, MptData, MtData, TglData, EndData, SocdData } from '@/types/keyboard';
import type {
  DksParamsSet,
  MptParamsSet,
  MtParamsSet,
  TglParamsSet,
  EndParamsSet,
  SocdParamsSet,
  RsParamsSet,
  DksParamsGet,
  MptParamsGet,
  MtParamsGet,
  TgltParamsGet,
  EndtParamsGet,
  SocdtParamsGet,
  RstParamsGet,
  DeleteHighLevelKeyParams,
} from '@/types/higherKey';

const state = {
  // highLevelKeys: {},
  // highLevelKeysData: [],
};

export const useHigherKeyStore = defineStore('highLevelKey', {
  state: () => state,
  getters: {},

  actions: {
    // 查询所有的高级键
    // 1:dks 2:mpt 3:MT 4:TGL 5:END 6:SOCD 7: RS
    async getHighLevelKeys(keyboardLayout) {
      for (let row = 0; row < keyboardLayout.length; row++) {
        // if (!this.highLevelKeysData[row]) this.highLevelKeysData[row] = [];
        for (let col = 0; col < keyboardLayout[row].length; col++) {
          const { keyValue } = keyboardLayout[row][col];
          // this.highLevelKeysData[row][col] = null;
          if (keyValue === 0) continue;
          // eslint-disable-next-line no-await-in-loop
          const result = await services.getHigherKey({ row, col });
          const data = result && typeof result === 'object' ? (result as any).data || {} : {};
          const mode = result && typeof result === 'object' && 'mode' in result ? (result as any).mode : 0;
          if (mode === 1) {
            this.getDks({ keyValue, data, row, col, mode });
          } else if (mode === 2) {
            this.getMpt({ keyValue, data, row, col, mode });
          } else if (mode === 3) {
            this.getMt({ keyValue, data, row, col, mode });
          } else if (mode === 4) {
            this.getTGL({ keyValue, data, row, col, mode });
          } else if (mode === 5) {
            this.getEnd({ keyValue, data, row, col, mode });
          } else if (mode === 6) {
            this.getSocd({ keyValue, data, row, col, mode });
          } else if (mode === 7) {
            this.getRS({ keyValue, data, row, col, mode });
          }
        }
      }
    },

    // 查询dks
    async getDks(params: DksParamsGet) {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const { keyValue, row, col, mode, data } = params;
      const { kcs, trps, dbs } = data;
      const db = dbs[0];
      const db2 = dbs[1];
      const dks = kcs;
      // const trps = trpsArr;
      const dksData: DksData = { keyValue, type: 'dks', mode, dks: [...dks], trps: [...trps], db, db2 };
      // this.highLevelKeysData[row][col] = dksData;
      const advancedKeys = {
        ...keyboardLayout.value[row][col].advancedKeys,
        dks: dksData,
        advancedType: mode,
      };
      keyboardLayout.value[row][col].advancedKeys = advancedKeys;
    },

    // 设置dks
    async setDks(params: DksParamsSet) {
      const { row, col, dks, trps, db, db2 } = params;
      const data = { kcs: [...dks], trps: [...trps], dbs: [db, db2] };
      const result = await services.setHigherKeyDKS({ row, col, data });
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      await this.getHighLevelKeys(keyboardLayout.value);

      return result;
    },

    // MPT
    async getMpt(params: MptParamsGet) {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const { keyValue, data, row, col, mode } = params;
      const { kcs, dbs } = data;
      const dbsAll = dbs.map((ite) => ite / 1000);
      const mptData: MptData = { keyValue, type: 'mpt', mode, dks: [...kcs], dbs: [...dbsAll] };
      // this.highLevelKeysData[row][col] = mptData;
      const advancedKeys = {
        ...keyboardLayout.value[row][col].advancedKeys,
        mpt: mptData,
        advancedType: mode,
      };
      keyboardLayout.value[row][col].advancedKeys = advancedKeys;
    },

    // 设置MPT
    async setMpt(params: MptParamsSet) {
      try {
        const { row, col, dks, dbs } = params;
        const data = { kcs: [...dks], dbs: [...dbs] };
        const result = await services.setHigherKeyMPT({ row, col, data });
        const keyboardStore = useKeyboardStore();
        const { keyboardLayout } = storeToRefs(keyboardStore);
        await this.getHighLevelKeys(keyboardLayout.value);
        return result;
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    // 查询MT
    async getMt(params: MtParamsGet) {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const { keyValue, data, row, col, mode } = params;
      const { kcs, time } = data;
      const mtData: MtData = { keyValue, type: 'mt', mode, mt: { delay: time, dksAll: kcs } };
      // this.highLevelKeysData[row][col] = mtData;
      const advancedKeys = {
        ...keyboardLayout.value[row][col].advancedKeys,
        mt: mtData,
        advancedType: mode,
      };
      keyboardLayout.value[row][col].advancedKeys = advancedKeys;
    },

    // 设置MT
    async setMT(params: MtParamsSet) {
      const { row, col, delay, dks } = params;
      const data = { time: delay, kcs: [...dks] };
      const result = await services.setHigherKeyMT({ row, col, mode: 'MT', data });
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      await this.getHighLevelKeys(keyboardLayout.value);
      return result;
    },

    // TGL
    async getTGL(params: TgltParamsGet) {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const { keyValue, data, row, col, mode } = params;
      const { kcs, time } = data;
      const tglData: TglData = { keyValue, type: 'tgl', mode, tgl: { kc: kcs, delay: time } };
      // this.highLevelKeysData[row][col] = tglData;
      const advancedKeys = {
        ...keyboardLayout.value[row][col].advancedKeys,
        tgl: tglData,
        advancedType: mode,
      };
      keyboardLayout.value[row][col].advancedKeys = advancedKeys;
    },

    async setTGL(params: TglParamsSet) {
      const { row, col, kc, delay } = params;
      const data = { kcs: kc, delay };
      const result = await services.setHigherKeyTGL({ row, col, mode: 'TGL', data });
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      await this.getHighLevelKeys(keyboardLayout.value);
      return result;
    },

    // END
    async getEnd(params: EndtParamsGet) {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const { keyValue, data, row, col, mode } = params;
      const { kcs, delay } = data;
      const endData: EndData = { keyValue, type: 'end', mode, end: { dks: [...kcs], delay } };
      // this.highLevelKeysData[row][col] = endData;
      const advancedKeys = {
        ...keyboardLayout.value[row][col].advancedKeys,
        end: endData,
        advancedType: mode,
      };
      keyboardLayout.value[row][col].advancedKeys = advancedKeys;
    },

    // 设置END
    async setEnd(params: EndParamsSet) {
      const { row, col, dks, delay } = params;
      const data = { kcs: [...dks], delay };
      const result = await services.setHigherKeyEND({ row, col, mode: 'END', data });
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      await this.getHighLevelKeys(keyboardLayout.value);
      return result;
    },

    // 查询当前高级键value
    async getSocd(params: SocdtParamsGet) {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const { keyValue, data, row, col, mode } = params;
      const { socdMode } = data;
      const socdData: SocdData = { keyValue, type: 'socd', mode, socdMode, socd: { ...data } };
      // this.highLevelKeysData[row][col] = socdData;
      const advancedKeys = {
        ...keyboardLayout.value[row][col].advancedKeys,
        socd: socdData,
        advancedType: mode,
      };
      keyboardLayout.value[row][col].advancedKeys = advancedKeys;
    },

    // 设置socd
    async setSocd(params: SocdParamsSet) {
      const { row, col, row2, col2, kcs, mode, delay } = params;
      const data = { row, col, row2, col2, socdMode: mode, delay, kcs };
      console.log('setsocd', data);
      const results = await services.setHigherKeySOCD(data);
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      await this.getHighLevelKeys(keyboardLayout.value);
      return results;
    },

    async getRS(params: RstParamsGet) {
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      const { keyValue, data, row, col, mode } = params;
      // const { kcs } = data;
      const rsData = { keyValue, type: 'rs', mode, rs: { ...data } };
      // this.highLevelKeysData[row][col] = rsData;
      const advancedKeys = {
        ...keyboardLayout.value[row][col].advancedKeys,
        rs: rsData,
        advancedType: mode,
      };
      keyboardLayout.value[row][col].advancedKeys = advancedKeys;
    },

    async setRS(params: RsParamsSet) {
      const { row, col, row2, col2, kcs, delay } = params;
      const data = { row2, col2, delay, kcs };
      console.log('setRS', data);
      const result = await services.setHigherKeyRS({ row, col, mode: 'RS', data });
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      await this.getHighLevelKeys(keyboardLayout.value);
      return result;
    },

    // 删掉高级键
    async deleteHighLevelKey(params: DeleteHighLevelKeyParams) {
      console.log('deleteHighLevelKey', params);
      const { row, col } = params;
      const keyboardStore = useKeyboardStore();
      const { keyboardLayout } = storeToRefs(keyboardStore);
      await services.setHigherKeyNONE({ row, col, mode: 'NONE', data: { mode: 0 } });
      // this.highLevelKeysData[row][col] = null;
      const resetAdvancedKeys = {
        advancedType: '',
        value: 0,
        dks: null,
        mpt: null,
        mt: null,
        tgl: null,
        end: null,
        socd: null,
        macro: null,
      };
      keyboardLayout.value[row][col].advancedKeys = { ...resetAdvancedKeys };
    },
  },
});
