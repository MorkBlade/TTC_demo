// import { debounce } from 'lodash-es';
import { defineStore } from 'pinia';
import _ from 'lodash';
import { usePerformanceStore } from './performance';
import { useHigherKeyStore } from './higherKey';
import { useGlobalStore } from './globalSetting';

import type {
  Color,
  KeyPosition,
  KeyboardState,
  KeyboardItemInfo,
  GetKeyCodeParams,
  SetKeyLayoutParams,
  GetKeyLayoutParams,
} from '@/types/keyboard';

import services from '@/services/index';

const keyboardItemInfo: KeyboardItemInfo = {
  col: -1,
  row: -1,
  keyValue: -1,

  customLight: { B: 0, G: 0, R: 0, isCustom: false },

  performance: {
    isGlobalTriggering: true,
    globalTriggeringValue: 0,
    isRt: false,
    isSingle: false,
    normalPress: 0,
    normalRelease: 0,
    rtFirstTouch: 0,
    rtPress: 0,
    rtRelease: 0,
    axis: 0,
    mode: 0,
    pressDeadStroke: 0,
    releaseDeadStroke: 0,
    advancedKeyMode: 0,
    calibrationData: 0,
    calibrations: 0,
    calibrate: 0,
    travels: 0,
    axisV2Id: 0,
    axisRangeMax: 0,
    axisCoefficient: 0,
  },

  advancedKeys: {
    advancedType: '',
    value: 0,
    dks: null,
    mpt: null,
    mt: null,
    tgl: null,
    end: null,
    socd: null,
    macro: null,
  },

  customKeys: {
    win: {
      fn0: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
      fn1: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
      fn2: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
      fn3: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
    },
    mac: {
      fn0: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
      fn1: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
      fn2: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
      fn3: { keyValue: -1, bindKeyValue: -1, defaultKeycode: -1 },
    },
  },
};

const state: KeyboardState = {
  fnLayer: 0,
  system: 0,
  keyLayoutConfig: { row: 6, col: 21 },
  keyLayoutStyle: [],
  keyboardLayout: [],
  activeKeys: [],
  inChangLight: false,
  selectKey: { row: null, col: null, keycode: null },
};

export const useKeyboardStore = defineStore('keyboard', {
  state: () => state,

  actions: {
    async getKeyLayoutStyle(): Promise<void> {
      const { row } = this.keyLayoutConfig;
      const keyLayoutStyle = [];
      for (let i = 0; i < row; i++) {
        // eslint-disable-next-line no-await-in-loop
        const res = await services.getKeyLayoutStyle({ row: i });
        const data = (res as any)?.keyLayoutStyle || res;
        keyLayoutStyle.push(data);
      }
      this.keyLayoutStyle = keyLayoutStyle;
    },

    async getKeyLayout(params: GetKeyLayoutParams): Promise<KeyboardItemInfo[][]> {
      const performanceStore = usePerformanceStore();
      const { row } = this.keyLayoutConfig;
      const keyboardLayout: number[][] = [];
      for (let i = 0; i < row; i++) {
        // eslint-disable-next-line no-await-in-loop
        const res = await services.getKeyLayout({ ...params, row: i });
        const data = (res as any)?.keyboardLayout || res;
        keyboardLayout.push(data);
      }
      const layoutData: KeyboardItemInfo[][] = [];
      const keyboardsWithPerformance: KeyboardItemInfo[][] = [];

      // Create an array of promises for processing each row
      const rowPromises = keyboardLayout.map(async (row: number[], rowIndex: number) => {
        if (layoutData[rowIndex] === undefined) layoutData[rowIndex] = [];

        // 为每一列创建处理Promise
        const colPromises = row.map(async (col: number, colIndex: number) => {
          // 1. 解构提取数据
          const { customKeys = {} } = this.keyboardLayout?.[rowIndex]?.[colIndex] || {};
          const { win = {}, mac = {} } = customKeys;

          // 2. 动态提取 keycodes
          const extractKeycodes = (obj) => [0, 1, 2, 3].map((i) => obj?.[`fn${i}`]?.defaultKeycode ?? -1);
          const [win0, win1, win2, win3] = extractKeycodes(win);
          const [mac0, mac1, mac2, mac3] = extractKeycodes(mac);

          // 3. 动态生成 customKeys
          const createCustomKeys = (keycodes, col) =>
            [0, 1, 2, 3].reduce(
              (acc, layer) => ({
                ...acc,
                [`fn${layer}`]: {
                  keyValue: -1,
                  bindKeyValue: col,
                  defaultKeycode: keycodes[layer],
                },
              }),
              {},
            );

          const customKeysWin = createCustomKeys([win0, win1, win2, win3], col);
          const customKeysMac = createCustomKeys([mac0, mac1, mac2, mac3], col);

          // 4. 并行请求所有层数据
          const layerPromises = [0, 1, 2, 3].map((layer) => this.getKeyCode({ layer, row: rowIndex, col: colIndex }));
          const results = await Promise.allSettled(layerPromises);

          // 5. 更新 bindKeyValue
          results.forEach((result, layer) => {
            if (result.status === 'fulfilled') {
              const { keycode } = result.value;
              customKeysWin[`fn${layer}`].bindKeyValue = keycode;
              customKeysMac[`fn${layer}`].bindKeyValue = keycode;
            }
          });

          // 6. 返回结果
          return {
            ...keyboardItemInfo,
            keyValue: col,
            row: rowIndex,
            col: colIndex,
            customKeys: {
              win: _.cloneDeep(customKeysWin),
              mac: _.cloneDeep(customKeysMac),
            },
          };
        });

        // 等待所有列处理完成
        const processedCols = await Promise.all(colPromises);
        layoutData[rowIndex].push(...(processedCols as KeyboardItemInfo[]));

        const performanceDataArray = await performanceStore.getPerformance(layoutData[rowIndex]);
        if (Array.isArray(performanceDataArray)) {
          let performanceIndex = 0;
          for (let i = 0; i < layoutData[rowIndex].length; i++) {
            if (performanceIndex < performanceDataArray.length) {
              if (layoutData[rowIndex][i].keyValue > 0) {
                layoutData[rowIndex][i].performance = {
                  ...layoutData[rowIndex][i].performance,
                  ...performanceDataArray[performanceIndex],
                };
                performanceIndex++;
              }
            }
          }
        }
        return layoutData[rowIndex];
      });

      // Wait for all row processing to complete
      const processedRows = await Promise.all(rowPromises);
      keyboardsWithPerformance.push(...processedRows);

      // Now set the keyboard layout after all processing is complete
      this.keyboardLayout = keyboardsWithPerformance;
      this.getKeyCustomLighting(keyboardsWithPerformance);
      const highLevelKeyStore = useHigherKeyStore();
      await highLevelKeyStore.getHighLevelKeys(this.keyboardLayout);
      // await this.getDefaultKeyLayout();
      return this.keyboardLayout;
    },

    async setKeyLayout(params: SetKeyLayoutParams) {
      const res = await services.setKeyLayout(params);
      return res;
    },

    async getKeyCode(params: GetKeyCodeParams) {
      const res = await services.getKeyCode(params);
      return res;
    },

    async setKeyCode(): Promise<any> {
      const specialKey = [61696, 61697, 61698, 61699];
      const { row, col, keycode } = this.selectKey;
      const globalStore = useGlobalStore();
      if (row !== null && col !== null && keycode !== null) {
        if (specialKey.includes(keycode)) {
          [0, 1, 2, 3].forEach(async (layer) => {
            if (layer > this.fnLayer) {
              await services.setKeyCode({ layer, row, col, keycode: 1 });
              this.keyboardLayout[row][col].keyValue = keycode;
              this.keyboardLayout[row][col].customKeys[globalStore.system.toLowerCase() as 'win' | 'mac'][
                `fn${layer}`
              ].bindKeyValue = keycode;
            }
            if (layer === this.fnLayer) {
              await services.setKeyCode({ layer, row, col, keycode });
              this.keyboardLayout[row][col].keyValue = keycode;
              this.keyboardLayout[row][col].customKeys[globalStore.system.toLowerCase() as 'win' | 'mac'][
                `fn${layer}`
              ].bindKeyValue = keycode;
            }
          });
        } else {
          const res = await services.setKeyCode({ layer: this.fnLayer, row, col, keycode });
          this.keyboardLayout[row][col].keyValue = keycode;
          this.keyboardLayout[row][col].customKeys[globalStore.system.toLowerCase() as 'win' | 'mac'][
            `fn${this.fnLayer}`
          ].bindKeyValue = keycode;
          return res;
        }
      }
      return null;
      // return MessagePlugin.warning('请选择需要修改的键位或拖拽到指定键位');
    },

    handleSelectKeyClick(position: KeyPosition, type: 'single' | 'multiple' = 'multiple'): void {
      const keyId = `${position.row}-${position.col}`;
      const isKeySelected = this.activeKeys.includes(keyId);

      if (type === 'single') {
        this.activeKeys = isKeySelected ? [] : [keyId];
      } else if (type === 'multiple') {
        // type === 'multiple'
        if (isKeySelected) {
          this.activeKeys = this.activeKeys.filter((key: string) => key !== keyId);
        } else {
          this.activeKeys.push(keyId);
        }
      }
    },

    handleHighLevelKeyClick(position: KeyPosition): void {
      const keyId = `${position.row}-${position.col}`;
      const isKeySelected = this.activeKeys.includes(keyId);
      if (this.activeKeys.length > 1 && !isKeySelected) {
        this.activeKeys.shift();
        this.activeKeys.push(keyId);
      } else if (isKeySelected) {
        this.activeKeys = this.activeKeys.filter((key: string) => key !== keyId);
      } else {
        this.activeKeys.push(keyId);
      }
    },

    // 选中WASD键
    selectWasdKey(): void {
      const activeKeys = [];
      this.keyboardLayout.forEach((row: KeyboardItemInfo[], rowIndex: number) => {
        row.forEach((key: KeyboardItemInfo, colIndex: number) => {
          if (key.keyValue === 4 || key.keyValue === 22 || key.keyValue === 26 || key.keyValue === 7) {
            activeKeys.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },

    selectAllKey(): void {
      const activeKeys = [];
      this.keyboardLayout.forEach((row: KeyboardItemInfo[], rowIndex: number) => {
        row.forEach((key: KeyboardItemInfo, colIndex: number) => {
          if (key.keyValue !== 0) {
            // 排除无效按键
            // 只选中有效按键
            activeKeys.push(`${rowIndex}-${colIndex}`);
          }
        });
      });
      this.activeKeys = activeKeys;
    },

    selectReverseKey(): void {
      const activeKeys = [];
      this.keyboardLayout.forEach((row: KeyboardItemInfo[], rowIndex: number) => {
        row.forEach((key: KeyboardItemInfo, colIndex: number) => {
          if (!this.activeKeys.includes(`${rowIndex}-${colIndex}`)) {
            if (key.keyValue !== 0) {
              // 排除无效按键
              // 只选中有效按键
              activeKeys.push(`${rowIndex}-${colIndex}`);
            }
          }
        });
      });
      this.activeKeys = activeKeys;
    },

    cancelSelectKey(): void {
      this.activeKeys = [];
    },

    // 切换fn层
    checkFnLayer(layer: number): void {
      this.fnLayer = layer;
    },

    checkSystem(system: number): void {
      this.system = system;
    },

    getSourceRowAndCol(row: number, col: number): { sourceRow: number; sourceCol: number } {
      const sourceKey = this.keyboardLayout[row][col];
      const { row: sourceRow, col: sourceCol } = sourceKey;
      return { sourceRow, sourceCol };
    },

    // 更新要改的键的位置
    updateSelectKey(params: KeyPosition): void {
      const { row, col } = params;
      this.selectKey.row = row;
      this.selectKey.col = col;
    },

    // 更新改键时拖拽的键的keycode
    updateSelectKeycode(keycode: number): void {
      this.selectKey.keycode = keycode;
    },

    // 获取默认布局
    async getDefaultKeyLayout() {
      const { row } = this.keyLayoutConfig;
      const systems = [0, 1];
      const fnLayers = [0, 1, 2, 3];
      for (const system of systems) {
        for (const fn of fnLayers) {
          for (let i = 0; i < row; i++) {
            // eslint-disable-next-line no-await-in-loop
            const res = await services.getDefaultKeyLayout({ row: i, fn, system });
            (res as any).keyCodes.forEach((item: any, index: number) => {
              this.keyboardLayout[i][index].customKeys[system === 0 ? 'win' : 'mac'][`fn${fn}`].defaultKeycode = item;
            });
          }
        }
      }
    },

    async restoreDefaultLayout() {
      // TODO:设置win和mac的key需要来回切换系统
      const globalStore = useGlobalStore();
      const { system } = storeToRefs(globalStore);
      await services.setSystemType(system.value === 'MAC' ? 'WIN' : 'MAC');
      for (const [rowIndex, row] of this.keyboardLayout.entries()) {
        for (const [colIndex, col] of row.entries()) {
          // eslint-disable-next-line no-await-in-loop
          await this.setCustomKeys(rowIndex, colIndex, col.customKeys, system.value === 'MAC' ? 'win' : 'mac');
        }
      }
      await services.setSystemType(system.value as 'WIN' | 'MAC');
      for (const [rowIndex, row] of this.keyboardLayout.entries()) {
        for (const [colIndex, col] of row.entries()) {
          // eslint-disable-next-line no-await-in-loop
          await this.setCustomKeys(rowIndex, colIndex, col.customKeys, system.value === 'MAC' ? 'mac' : 'win');
        }
      }
    },

    async setCustomKeys(row: number, col: number, customKeys, system: 'win' | 'mac') {
      console.log('customKeys', customKeys);
      const { fn0, fn1, fn2, fn3 } = customKeys[system];
      const fnPromises = [];
      for (let i = 0; i < 4; i++) {
        const fn = [fn0, fn1, fn2, fn3][i];
        if (fn) {
          const { defaultKeycode } = fn;
          // eslint-disable-next-line no-await-in-loop
          const res = await services.setKeyCode({ row, col, layer: i, keycode: defaultKeycode });
          // this.keyboardLayout[row][col].customKeys[system][`fn${i}`].defaultKeycode = defaultKeycode;
          this.keyboardLayout[row][col].customKeys[system][`fn${i}`].bindKeyValue = defaultKeycode;
          this.keyboardLayout[row][col].keyValue = defaultKeycode;
          fnPromises.push(Promise.resolve(res));
        } else {
          fnPromises.push(Promise.resolve(null));
        }
      }

      const results = await Promise.allSettled(fnPromises);
      return results;
    },

    getKeycode(position: KeyPosition): number {
      return this.keyboardLayout[position.row][position.col].keyValue;
    },

    async getKeyCustomLighting(keyboardLayout: KeyboardItemInfo[][]): Promise<void> {
      const res = await services.getLightingCustom();
      for (let row = 0; row < keyboardLayout.length; row++) {
        if (this.keyboardLayout[row] === undefined) this.keyboardLayout[row] = [];
        for (let col = 0; col < keyboardLayout[row].length; col++) {
          this.keyboardLayout[row][col].customLight = res[row][col];
        }
      }
      return res;
    },

    async setKeyColor(rowIndex: number, colIndex: number, color: Color, isCustom: boolean) {
      const { R, G, B } = color;
      this.keyboardLayout[rowIndex][colIndex].customLight.R = R;
      this.keyboardLayout[rowIndex][colIndex].customLight.G = G;
      this.keyboardLayout[rowIndex][colIndex].customLight.B = B;
      this.keyboardLayout[rowIndex][colIndex].customLight.isCustom = isCustom;

      // 使用防抖函数包装 API 调用
      this.debouncedSetLightingCustom();
    },

    async resetKeyboardLighting() {
      this.keyboardLayout.forEach((row) => {
        row.forEach((col) => {
          col.customLight.isCustom = false;
        });
      });

      // 使用防抖函数包装 API 调用
      this.debouncedSetLightingCustom();
    },

    async debouncedSetLightingCustom(): Promise<Color[][]> {
      const globalStore = useGlobalStore();
      const spaceCount = globalStore.specialLighting;
      const customLightData = [];
      this.keyboardLayout.forEach((row: KeyboardItemInfo[], rowIndex: number) => {
        if (!customLightData[rowIndex]) customLightData[rowIndex] = [];
        row.forEach((col: KeyboardItemInfo) => {
          customLightData[rowIndex].push(col.customLight);
        });
      });
      if (spaceCount === 3) {
        customLightData[globalStore.spaceIndex.row][globalStore.spaceIndex.col - 2] = {
          ...customLightData[globalStore.spaceIndex.row][globalStore.spaceIndex.col - 1],
        };
        customLightData[globalStore.spaceIndex.row][globalStore.spaceIndex.col + 2] = {
          ...customLightData[globalStore.spaceIndex.row][globalStore.spaceIndex.col + 1],
        };
      }
      const res = await services.setLightingCustom({ area: 'Keyboard', protocol: 'Custom', data: customLightData });
      return res;
    },
  },
});
