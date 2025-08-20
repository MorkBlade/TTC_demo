import { useLightingStore, useKeyboardStore } from '@/store';

export function useSaturationHook() {
  const lightingStore = useLightingStore();
  const keyboardStore = useKeyboardStore();
  // 获取路由参数isGgb
  const route = useRoute();

  const isSaturationOpen = computed(() => {
    const rgb = route.query?.rgb;
    return rgb === 'true';
  });

  const handleSaturationChange = async () => {
    lightingStore.setLightingColorCorrection();
  };

  // 恢复默认灯光
  const handleRestoreDefaultLight = () => {
    // 自定义灯光的问题
    if (lightingStore.area === 'Keyboard') {
      keyboardStore.resetKeyboardLighting();
    } else {
      lightingStore.setDecorateColorAll();
    }
  };
  return {
    isSaturationOpen,
    handleSaturationChange,
    handleRestoreDefaultLight,
  };
}
