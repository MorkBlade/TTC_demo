import detectZoom from 'detect-zoom';
import { useWindowSize, useDebounceFn } from '@vueuse/core';
import { watch } from 'vue';

const DESIGN_WIDTH = 1920;
const BASE_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

export function useAdaptiveRem(designWidth = DESIGN_WIDTH, baseFontSize = BASE_FONT_SIZE) {
  const { width } = useWindowSize();

  const updateFontSize = () => {
    const zoom = detectZoom.zoom() || 1;
    const layoutScale = width.value / designWidth;
    let fontSize = (baseFontSize * layoutScale) / zoom;
    fontSize = Math.max(MIN_FONT_SIZE, Math.min(fontSize, MAX_FONT_SIZE));
    document.documentElement.style.fontSize = `${fontSize}px`;
  };

  const debouncedUpdate = useDebounceFn(updateFontSize, 200);

  watch(width, debouncedUpdate, { immediate: true });

  return {
    updateFontSize: debouncedUpdate,
  };
}
