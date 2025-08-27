import { useKeyboardStore } from '@/store';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import type { ShapeComputed, KeyboardLayoutParams, KeyStyle, LocationComputed } from '@/types/keyboard';

export function useStyleKeyCapsHook(rowIndex, colIndex, { shapeScale, location }) {
  const keyboardStore = useKeyboardStore();
  const shape: KeyboardLayoutParams = { height: 54, width: 54 };
  const isIcon = ref(false);
  const keyCode = computed<string>(() => {
    if (keyboardStore.keyboardLayout?.[rowIndex]?.[colIndex]) {
      const { keyValue } = keyboardStore.keyboardLayout[rowIndex][colIndex];
      const { type } = keyboardStore.keyLayoutStyle[rowIndex][colIndex];
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
    const labelHeight = shapeHeight - 18;
    const labelWidth = shapeWidth - 18;
    let shapeWidth2 = 0;
    let shapeHeight2 = 0;
    // let contentWidth2 = 0;
    // let contentHeight2 = 0;
    // let labelHeight2 = 0;
    // let labelWidth2 = 0;
    if (w2 && h2) {
      shapeWidth2 = w2 * Number(shape.width);
      shapeHeight2 = h2 * Number(shape.height);
      // const contentWidth2 = shapeWidth2 - 12;
      // const contentHeight2 = shapeHeight2 - 12;
      // const labelHeight2 = shapeHeight2 - 18;
      // const labelWidth2 = shapeWidth2 - 18;
    }
    return { shapeWidth, shapeHeight, contentWidth, contentHeight, labelHeight, labelWidth, shapeWidth2, shapeHeight2 };
  });

  const locationComputed = computed<LocationComputed>(() => {
    const { y, x, y2, x2 } = location;
    const { width, height } = shape;
    const keyBorderTop = y * Number(width) + 1;
    const keyBorderLeft = x * Number(height) + 1;

    const keyBorderTop2 = y2 * Number(width);
    const keyBorderLeft2 = x2 * Number(height);
    const top = keyBorderTop + 5;
    const left = keyBorderLeft + 6;
    const top2 = keyBorderTop2 + 5;
    const left2 = keyBorderLeft2 + 6;
    return { x, y, top, left, keyBorderTop, keyBorderLeft, x2, y2, top2, left2, keyBorderTop2, keyBorderLeft2 };
  });

  const keyBorder = computed<KeyStyle>(() => {
    const { shapeWidth, shapeHeight } = shapeComputed.value;
    const { keyBorderTop, keyBorderLeft } = locationComputed.value;
    const { ratio } = keyboardStore.keyLayoutStyle[rowIndex][colIndex];
    const radius = ratio === 12 ? '50%' : '5px';
    return {
      top: `${keyBorderTop}px`,
      left: `${keyBorderLeft}px`,
      width: `${shapeWidth}px`,
      height: `${shapeHeight}px`,
      borderWidth: `${1}px`,
      borderRadius: radius,
    };
  });

  const keyBorder2 = computed<KeyStyle>(() => {
    const { shapeWidth2, shapeHeight2 } = shapeComputed.value;
    const { keyBorderTop2, keyBorderLeft2 } = locationComputed.value;
    return {
      top: `${keyBorderTop2}px`,
      left: `${keyBorderLeft2}px`,
      width: `${shapeWidth2}px`,
      height: `${shapeHeight2}px`,
      borderWidth: `${1}px`,
      borderRadius: `${5}px`,
    };
  });

  const keyBorder2Cover = computed<KeyStyle>(() => {
    const { shapeWidth2, shapeHeight2 } = shapeComputed.value;
    const { keyBorderTop2, keyBorderLeft2 } = locationComputed.value;
    return {
      top: `${keyBorderTop2 + 1}px`,
      left: `${keyBorderLeft2 + 1}px`,
      width: `${shapeWidth2 - 2}px`,
      height: `${shapeHeight2 - 2}px`,
      borderWidth: `${1}px`,
      borderRadius: `${5}px`,
      backgroundColor: '#292a2e',
      borderColor: '#292a2e',
      zIndex: 299,
    };
  });

  const keyLabels = computed<KeyStyle>(() => {
    const { left, top } = locationComputed.value;
    const { contentWidth, contentHeight } = shapeComputed.value;
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${contentWidth}px`,
      height: `${contentHeight}px`,
    };
  });

  return {
    keyCode,
    keyBorder,
    keyBorder2,
    keyBorder2Cover,
    keyLabels,
    isIcon,
  };
}
