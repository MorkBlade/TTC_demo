import { ref } from 'vue';
import { throttle } from 'lodash';
import { useLightingStore, useGlobalStore } from '@/store';
import { useLightingRaf } from '@/hooks/lighting/useLightingRaf';
import { useKeyboardStore } from '@/store/modules/keyboard';
import type { Color } from '@/types/keyboard';

export function useLightingUpdateHook() {
  const lightingStore = useLightingStore();
  const globalStore = useGlobalStore();
  const keyboardStore = useKeyboardStore();

  const lastUpdateTime = ref(0);
  const updateInterval = 50;
  const isUpdating = ref(false);
  const isUnmounted = ref(false);
  const areaIndex = ref(0);

  // 批量更新灯光数据
  const updateLightingData = throttle(async (lightingData: Color[][]) => {
    // 增加数据结构防御
    if (!Array.isArray(lightingData) || !Array.isArray(lightingData[0])) return;
    // 创建一个样式元素
    let styleElement = document.getElementById('keyboard-lighting-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'keyboard-lighting-styles';
      document.head.appendChild(styleElement);
    }

    // 构建 CSS 规则
    const cssRules = lightingData
      .map((row, rowIndex) => {
        if (!Array.isArray(row)) return '';
        return row
          .map((light, colIndex) => {
            if (!light) return '';
            const { R, G, B } = light;
            const brightness = (R * 299 + G * 587 + B * 114) / 1000;
            const fontColor = brightness > 128 ? '#000000' : '#FFFFFF';
            return `.key[data-row="${rowIndex}"][data-col="${colIndex}"] {
              --key-color: rgba(${R},${G},${B},1);
              --key-font-color: ${fontColor};
            }`;
          })
          .join('\n');
      })
      .join('\n');

    styleElement.textContent = cssRules;
  }, 100);

  const lightingRaf = useLightingRaf(async (timestamp) => {
    if (isUnmounted.value) return;
    if (timestamp - lastUpdateTime.value >= updateInterval) {
      lastUpdateTime.value = timestamp;
      if (!isUpdating.value) {
        isUpdating.value = true;
        try {
          if (areaIndex.value === 0) {
            const res = await keyboardStore.getKeyCustomLighting(keyboardStore.keyboardLayout);
            // console.log('xasdasfsdxvwsdfasdasdg', res);
            if (Array.isArray(res) && Array.isArray(res[0])) {
              await updateLightingData(res as Color[][]);
            }
          } else {
            const data = globalStore.lightingArea[areaIndex.value];
            if (data) {
              const { rows, cols, index } = data;
              await lightingStore.getDecorateColor({ rows, cols, index });
            }
          }
        } catch (error) {
          console.warn('更新灯光数据失败:', error);
        } finally {
          isUpdating.value = false;
        }
      }
    }
  });

  return {
    lastUpdateTime,
    updateInterval,
    isUpdating,
    isUnmounted,
    updateLightingData,
    lightingRaf,
    areaIndex,
  };
}
