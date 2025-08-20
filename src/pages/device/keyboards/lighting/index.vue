<template>
  <div class="device-keyboard-lighting">
    <div
      v-px2rem="{
        styles: () => ({
          width: `${containerDimensions.width}px`,
          height: `${Number(containerDimensions.height) - 20}px`,
        }),
      }"
      class="device-keyboard-lighting__container"
    >
      <template v-for="(row, rowIndex) in layout">
        <template v-for="(column, colIndex) in row" :key="`${column.rowIndex}-${column.colIndex}`">
          <key-cap
            :row="column.rowIndex"
            :col="column.colIndex"
            :location="column.location"
            :shape-scale="column.shapeScale"
            :layout-row-index="rowIndex"
            :layout-col-index="colIndex"
          >
          </key-cap>
        </template>
      </template>
      <div class="tip">
        <p>
          <t-icon
            v-px2rem="{
              styles: () => ({
                marginRight: '2px',
              }),
            }"
            name="mouse"
            size="14"
            style=""
          />{{ t('messages.lightingDecorTip') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeviceKeyboardLighting' });

import { cloneDeep } from 'lodash';
import KeyCap from './key-caps/index.vue';
import { useKeyboardStyle } from '../hooks/useKeyboardStyle';
import { useGlobalStore } from '@/store';
import { t } from '@/locales';
import { KeyboardLayoutItem } from '@/types/keyboard';

const globalStore = useGlobalStore();

const { containerDimensions, ratioMap, currentKeyLayoutStyle } = useKeyboardStyle();

const specialLighting = computed<number>(() => {
  return globalStore.specialLighting;
});

// 获取键盘的空格位置，怎么获取呢？通过键盘的样式获取 修改键盘的样式值。
// 重写键盘样式计算，计算空格位置 然后进行拆分

const layout = computed<KeyboardLayoutItem[][]>(() => {
  const layoutDeep: KeyboardLayoutItem[][] = [];
  const spaceCount = specialLighting.value;
  const currentKeyLayoutStyleDeep = cloneDeep(currentKeyLayoutStyle.value);
  currentKeyLayoutStyleDeep.forEach((row, rowIndex) => {
    if (layoutDeep[rowIndex] === undefined) {
      layoutDeep[rowIndex] = [];
    }
    if (rowIndex === 5 && spaceCount > 1) {
      // 首先计算出空格的下标
      const spaceIndex = { rowIndex: 5, colIndex: 0, ratio: 0 };
      row.forEach((col, colIndex) => {
        const { row: locationRow, col: locationCol, ratio } = col;
        if (
          colIndex > 2 &&
          locationRow !== 0 &&
          locationCol !== 0 &&
          ratio !== 0 &&
          spaceIndex.colIndex === 0 &&
          spaceIndex.rowIndex === 5
        ) {
          // 重写空格位置
          spaceIndex.rowIndex = rowIndex;
          spaceIndex.colIndex = colIndex;
          globalStore.spaceIndex.row = rowIndex;
          globalStore.spaceIndex.col = colIndex;
          spaceIndex.ratio = ratio;

          const colValue = col.col;
          const startIndex = Math.max(0, colIndex - Math.floor(spaceCount / 2));
          const endIndex = Math.min(row.length - 1, colIndex + Math.floor(spaceCount / 2));
          for (let i = startIndex; i <= endIndex; i++) {
            row[i].row = locationRow;
            row[i].col = colValue + (i - startIndex) * Number((ratioMap[ratio].w / spaceCount).toFixed(2));
            row[i].ratio = 9;
            row[i].isSpaceWidthStyle = true;
          }
        }
      });
    }
    row.forEach((col, colIndex) => {
      const { ratio } = col;
      if (ratio !== 0 && ratio !== 12) {
        const data = {
          shapeScale: { w: ratioMap[ratio].w, h: ratioMap[ratio].h, w2: ratioMap[ratio].w2, h2: ratioMap[ratio].h2 },
          location: { row: col.row, col: col.col },
          colIndex,
          rowIndex,
          isSpaceWidthStyle: col.isSpaceWidthStyle || false,
        };
        if (col.isSpaceWidthStyle) {
          data.shapeScale.w = Number((ratioMap[ratio].w / spaceCount).toFixed(2));
          data.shapeScale.h = ratioMap[ratio].h;
        }
        layoutDeep[rowIndex].push(data);
      }
    });
  });

  // 记录空行的索引
  const emptyRowIndexes: number[] = [];
  layoutDeep.forEach((row, rowIndex) => {
    if (row.length === 0) {
      emptyRowIndexes.push(rowIndex);
    }
  });

  // 从后向前删除空行，避免索引变化
  for (let i = emptyRowIndexes.length - 1; i >= 0; i--) {
    layoutDeep.splice(emptyRowIndexes[i], 1);
  }

  // 更新剩余行的位置信息
  layoutDeep.forEach((row, _rowIndex) => {
    row.forEach((item) => {
      const emptyRowsBefore = emptyRowIndexes.filter((index) => index < item.location.row).length;
      if (emptyRowsBefore > 0) {
        item.location.row -= emptyRowsBefore;
      }
    });
  });

  return layoutDeep;
});
</script>

<style scoped lang="less">
@import './index.less';

.grabbing {
  cursor: grabbing !important;
}

.grab {
  cursor: grab;
}
</style>
