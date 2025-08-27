import type { RatioValue, RatioKey, KeyLayoutStyleItem, LayoutItem, KeyboardLayoutParams } from '@/types/keyboard';
import { useKeyboardStore } from '@/store';
import { layoutConfig } from '@/constants/layout';

export function useKeyboardStyle() {
  const keyboardStore = useKeyboardStore();

  const ratioMap: Record<RatioKey, RatioValue> = {
    0: { w: 0, h: 0 },
    1: { w: 1, h: 1 },
    2: { w: 1.28, h: 1 },
    3: { w: 1.5, h: 1 },
    4: { w: 1.75, h: 1 },
    5: { w: 2, h: 1 },
    6: { w: 2.28, h: 1 },
    7: { w: 2.5, h: 1 },
    8: { w: 2.8, h: 1 },
    9: { w: 6.25, h: 1 },
    10: { w: 1, h: 2 },
    11: { w: 1.5, w2: 1.25, h: 1, h2: 2, x: -0.25, x2: 0.25 },
    12: { w: 1, h: 1 },
    13: { w: 2, h: 1 },
    14: { w: 1.75, h: 1 },
  };
  const currentKeyLayoutStyle = computed<KeyLayoutStyleItem[][]>(() => keyboardStore.keyLayoutStyle);
  const layout = computed<LayoutItem[][]>(() => {
    const layout = Array.from({ length: 6 }, () =>
      Array.from({ length: 21 }, () => JSON.parse(JSON.stringify(layoutConfig))),
    );
    try {
      if (currentKeyLayoutStyle.value.length > 0) {
        let offsetY = 0;
        currentKeyLayoutStyle.value.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            const { row: y, col: x, ratio } = col;
            // 如果当前行是空行，后面行往上偏移一个单位
            if (rowIndex > 0 && layout[rowIndex - 1].filter((item) => item.shapeScale.w !== 0).length === 0) {
              offsetY = 1;
            }
            if (ratio === 11) {
              layout[rowIndex][colIndex].shapeScale.w = ratioMap[ratio].w;
              layout[rowIndex][colIndex].shapeScale.h = ratioMap[ratio].h;
              layout[rowIndex][colIndex].shapeScale.w2 = ratioMap[ratio].w2;
              layout[rowIndex][colIndex].shapeScale.h2 = ratioMap[ratio].h2;
              layout[rowIndex][colIndex].location.x = x + colIndex * 0.05;
              layout[rowIndex][colIndex].location.y = y + rowIndex * 0.05 - offsetY;
              layout[rowIndex][colIndex].location.x2 = x + colIndex * 0.05 + ratioMap[ratio].x2;
              layout[rowIndex][colIndex].location.y2 = y + rowIndex * 0.05 - offsetY;
              layout[rowIndex][colIndex].location.row = rowIndex;
              layout[rowIndex][colIndex].location.col = colIndex;
            } else if (ratio === 9) {
              layout[rowIndex][colIndex].shapeScale.w = ratioMap[ratio].w + 0.3;
              layout[rowIndex][colIndex].shapeScale.h = ratioMap[ratio].h;
              layout[rowIndex][colIndex].location.x = x + colIndex * 0.032;
              layout[rowIndex][colIndex].location.y = y + rowIndex * 0.05 - offsetY;
              layout[rowIndex][colIndex].location.row = rowIndex;
              layout[rowIndex][colIndex].location.col = colIndex;
            } else if (ratio === 6) {
              layout[rowIndex][colIndex].shapeScale.w = ratioMap[ratio].w + 0.05;
              layout[rowIndex][colIndex].shapeScale.h = ratioMap[ratio].h;
              layout[rowIndex][colIndex].location.x = x + colIndex * 0.05;
              layout[rowIndex][colIndex].location.y = y + rowIndex * 0.05 - offsetY;
              layout[rowIndex][colIndex].location.row = rowIndex;
              layout[rowIndex][colIndex].location.col = colIndex;
            } else if (ratio === 8) {
              layout[rowIndex][colIndex].shapeScale.w = ratioMap[ratio].w + 0.05;
              layout[rowIndex][colIndex].shapeScale.h = ratioMap[ratio].h;
              layout[rowIndex][colIndex].location.x = x + colIndex * 0.05;
              layout[rowIndex][colIndex].location.y = y + rowIndex * 0.05 - offsetY;
              layout[rowIndex][colIndex].location.row = rowIndex;
              layout[rowIndex][colIndex].location.col = colIndex;
            } else {
              layout[rowIndex][colIndex].shapeScale.w = ratioMap[ratio].w;
              layout[rowIndex][colIndex].shapeScale.h = ratioMap[ratio].h;
              layout[rowIndex][colIndex].location.x = x + colIndex * 0.055;
              layout[rowIndex][colIndex].location.y = y + rowIndex * 0.05 - offsetY;
              layout[rowIndex][colIndex].location.row = rowIndex;
              layout[rowIndex][colIndex].location.col = colIndex;
            }
          });
        });
      }
      return layout;
    } catch (error) {
      console.log('error: ', error);
    }
    return layout;
  });

  const UNIT = 53; // 单位宽度/高度（单位：px）

  const containerDimensions = computed<KeyboardLayoutParams>(() => {
    // 默认尺寸
    const defaultDimensions = { width: 885, height: 350 };

    if (!layout.value || layout.value.length === 0) {
      return defaultDimensions;
    }

    let maxX = 0;
    let maxY = 0;

    layout.value.forEach((row) => {
      if (!Array.isArray(row)) return;

      row.forEach((column) => {
        const { w, h } = column.shapeScale || {};
        const { x = 0, y = 0 } = column.location || {};

        if (typeof w !== 'number' || typeof h !== 'number' || w === 0 || h === 0) return;

        const rightEdge = (x + w) * UNIT + 1;
        const bottomEdge = (y + h) * UNIT - 5;

        maxX = Math.max(maxX, rightEdge);
        maxY = Math.max(maxY, bottomEdge);
      });
    });

    // 容器尺寸 + 一定边距
    return { width: maxX + 40, height: maxY + 60 };
  });

  return { layout, containerDimensions, ratioMap, currentKeyLayoutStyle, layoutConfig };
}
