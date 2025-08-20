import { useKeyboardStore } from '@/store';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import type { ShapeComputed, KeyboardLayoutParams, KeyStyle, LocationComputed, KeyColorResult } from '@/types/keyboard';

export function useStyleKeyCapsHook(row, col, { layoutRowIndex, layoutColIndex }, { shapeScale, location }) {
  const keyboardStore = useKeyboardStore();
  const shape: KeyboardLayoutParams = { height: 54, width: 54 };
  const isIcon = ref(false);
  const keyCode = computed<string>(() => {
    if (keyboardStore.keyboardLayout?.[row]?.[col]) {
      const { keyValue } = keyboardStore.keyboardLayout[row][col];
      const { type } = keyboardStore.keyLayoutStyle[row][col];
      if (keyValue === null || keyValue === undefined) return '';
      if (['media', 'light', 'control', 'mouse'].includes(keyboardMap[keyValue]?.typeof)) {
        isIcon.value = true;
        return keyValue;
      }
      if (type !== 'key') {
        isIcon.value = true;
        return type;
      }
      isIcon.value = false;
      return keyboardMap[keyValue]?.name || '';
    }
    return '';
  });

  const shapeComputed = computed<ShapeComputed>(() => {
    const { w, h, w2, h2 } = shapeScale;
    const shapeWidth = w * Number(shape.width);
    const shapeHeight = h * Number(shape.height);
    const contentWidth = shapeWidth - 12;
    const contentHeight = shapeHeight - 12;
    let shapeWidth2 = 0;
    let shapeHeight2 = 0;
    if (w2 && h2) {
      shapeWidth2 = w2 * Number(shape.width);
      shapeHeight2 = h2 * Number(shape.height);
    }
    return { shapeWidth, shapeHeight, shapeWidth2, shapeHeight2, contentWidth, contentHeight };
  });

  const locationComputed = computed<Pick<LocationComputed, 'top' | 'left' | 'top2' | 'left2'>>(() => {
    const { width, height } = shape;
    const { col, row } = location;
    const top = row * Number(width);
    const left = col * Number(height);
    const top2 = row * Number(width);
    const left2 = col * Number(height) + Number(height) / 2;
    return { top, left, top2, left2 };
  });

  const keyCap = computed<KeyStyle>(() => {
    const { shapeWidth, shapeHeight } = shapeComputed.value;
    const { top, left } = locationComputed.value;
    const { ratio } = keyboardStore.keyLayoutStyle[row][col];
    const radius = ratio === 12 ? '50%' : '5px';
    return {
      top: `${top === 0 ? top : top + layoutRowIndex * 2}px`,
      left: `${left === 0 ? left : left + layoutColIndex * 2}px`,
      width: `${shapeWidth}px`,
      height: `${shapeHeight}px`,
      borderWidth: `${1}px`,
      borderRadius: radius,
    };
  });

  const keyCap2 = computed<KeyStyle>(() => {
    const { shapeWidth2, shapeHeight2 } = shapeComputed.value;
    const { top2, left2 } = locationComputed.value;
    return {
      top: `${top2 === 0 ? top2 : top2 + layoutRowIndex * 2}px`,
      left: `${left2 === 0 ? left2 : left2 + layoutColIndex * 1}px`,
      width: `${shapeWidth2}px`,
      height: `${shapeHeight2}px`,
      borderWidth: `${1}px`,
      borderRadius: `${5}px`,
    };
  });

  const keyCap2Cover = computed<KeyStyle>(() => {
    const { shapeWidth2, shapeHeight2 } = shapeComputed.value;
    const { top2, left2 } = locationComputed.value;
    return {
      top: `${top2 === 0 ? top2 : top2 + layoutRowIndex * 2 + 1}px`,
      left: `${left2 === 0 ? left2 : left2 + layoutColIndex * 1 + 1}px`,
      width: `${shapeWidth2 - 2}px`,
      height: `${shapeHeight2 - 2}px`,
      borderWidth: `${1}px`,
      borderRadius: `${5}px`,
      zIndex: 299,
    };
  });

  const keyLabels = computed<KeyStyle>(() => {
    // 间距
    const { left, top } = locationComputed.value;
    const { contentWidth, contentHeight } = shapeComputed.value;
    return {
      top: `${top === 0 ? top : top + layoutRowIndex * 2 + 6}px`,
      left: `${left === 0 ? left : left + layoutColIndex * 2 + 6}px`,
      width: `${contentWidth}px`,
      height: `${contentHeight}px`,
    };
    // return { padding: `4px`, width: `100%`, height: `100%`, position: 'relative', zIndex: 108 };
  });

  const keyColor = computed<KeyColorResult>(() => {
    const { R, G, B, isCustom } = keyboardStore.keyboardLayout[row][col].customLight || {
      R: 100,
      G: 100,
      B: 255,
      isCustom: false,
    };
    const brightness = (R * 299 + G * 587 + B * 114) / 1000;
    return { color: `rgba(${R},${G},${B},1)`, isCustom, brightness, fontColor: `var(--key-font-color)` };
  });

  return { keyCap, keyColor, keyLabels, keyCode, isIcon, keyCap2, keyCap2Cover };
}
