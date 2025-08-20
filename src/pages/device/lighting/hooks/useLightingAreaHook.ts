import { ref } from 'vue';
import debounce from 'lodash/debounce';
import { useLightingStore, useGlobalStore } from '@/store';
import { useLightingRaf } from '@/hooks/lighting/useLightingRaf';

export function useLightingAreaHook(lightingRaf: ReturnType<typeof useLightingRaf>, areaIndex: Ref<number>) {
  const lightingStore = useLightingStore();
  const globalStore = useGlobalStore();
  const { isDoubleLighting } = storeToRefs(globalStore);
  const isSwitchingArea = ref(false);

  const handleRadioGroupChange = async (value: string, index: number) => {
    if (isSwitchingArea.value) return;
    isSwitchingArea.value = true;
    try {
      lightingStore.area = value;
      areaIndex.value = index;
      await handleLightDecorateModeChange(index);
      lightingStore.updateArea(value);
      lightingStore.lightingAreaIndex = index;
      const lampData = isDoubleLighting.value ? 'DoubleLighting' : 'SingleLighting';
      lightingStore.lamp = lampData;
      await lightingStore.getLightingBase(lampData);
    } finally {
      isSwitchingArea.value = false;
    }
  };

  const handleRadioGroupMonitoring = async (value: string, index: number) => {
    if (isSwitchingArea.value) return;
    isSwitchingArea.value = true;
    try {
      lightingStore.area = value;
      areaIndex.value = index;
      // await handleLightDecorateModeChange(index);
      lightingStore.updateArea(value);
      lightingStore.lightingAreaIndex = index;
      const lampData = isDoubleLighting.value ? 'DoubleLighting' : 'SingleLighting';
      lightingStore.lamp = lampData;
    } finally {
      isSwitchingArea.value = false;
    }
  };

  const handleLightDecorateModeChange = async (idx: number) => {
    lightingRaf.stop();
    areaIndex.value = idx;

    if (idx === 0) {
      lightingRaf.start();
    } else {
      const data = globalStore.lightingArea[idx];
      if (data) {
        const { rows, cols, index } = data;
        await lightingStore.getDecorateColor({ rows, cols, index });
      }
      lightingRaf.start();
    }
  };

  // 保存 debounce 实例
  const handleRadioGroupChangeDebounced = debounce(handleRadioGroupChange, 300);

  return {
    isSwitchingArea,
    handleRadioGroupChange,
    handleLightDecorateModeChange,
    handleRadioGroupMonitoring,
    handleRadioGroupChangeDebounced,
  };
}
