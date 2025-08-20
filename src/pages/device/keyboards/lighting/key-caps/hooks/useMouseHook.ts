import { useKeyboardStore, useLightingStore } from '@/store';
import type { Color } from '@/types/keyboard';

export function useMouseHook(row, col) {
  const keyboardStore = useKeyboardStore();
  const lightingStore = useLightingStore();

  const startMouseDown = (e: MouseEvent) => {
    keyboardStore.inChangLight = true;
    if (e.button === 0) {
      changeKeyLightColor(e);
    }
    // 如果当前键位是右键
    if (e.button === 2) {
      lightingStore.contextMenuVisible = true;
      changeKeyLightColor(e, false);
    }
  };

  const handleMouseOver = (e: MouseEvent) => {
    // console.log('handleMouseOver');
    if (keyboardStore.inChangLight) {
      if (lightingStore.contextMenuVisible) {
        changeKeyLightColor(e, false);
      } else {
        changeKeyLightColor(e);
      }
    }
  };

  const handleContextmenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  const changeKeyLightColor = async (e: MouseEvent, isCustom = true) => {
    let color: Color;
    if (!isCustom) {
      color = { R: 0, G: 0, B: 0 };
    } else {
      color = lightingStore.colorPickerPanel;
    }
    keyboardStore.setKeyColor(row, col, color, isCustom);
  };

  const startMouseUp = (e: MouseEvent) => {
    keyboardStore.inChangLight = false;
    if (e.button === 2) {
      lightingStore.contextMenuVisible = false;
    }
  };
  return { startMouseUp, handleContextmenu, startMouseDown, handleMouseOver };
}
