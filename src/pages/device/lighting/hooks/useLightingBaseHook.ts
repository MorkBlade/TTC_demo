import { debounce } from 'lodash';
import { useLightingStore } from '@/store';

export function useLightingBaseHook() {
  const lightingStore = useLightingStore();
  const { getCurrentLightingLamp, getCurrentLightingStatus } = storeToRefs(lightingStore);
  const handleLuminanceChange = debounce(async (value: number) => {
    lightingStore.updateLuminance(value);
    await lightingStore.setLightingBase(getCurrentLightingStatus.value, getCurrentLightingLamp.value);
  }, 20);

  const handleSpeedChange = debounce(async (value: number) => {
    lightingStore.updateSpeed(value);
    await lightingStore.setLightingBase(getCurrentLightingStatus.value, getCurrentLightingLamp.value);
  }, 20);

  const handleLightDynamicModeChange = async (idx: number) => {
    lightingStore.updateMode(idx);
    await lightingStore.setLightingBase(getCurrentLightingStatus.value, getCurrentLightingLamp.value);
  };

  const onChangeLight = async (value: boolean) => {
    lightingStore.updateSwitch(value);
    await lightingStore.setLightingBase(getCurrentLightingStatus.value, getCurrentLightingLamp.value);
  };

  const ChangeColor = async (idx: number) => {
    lightingStore.updateSelectStaticColor(idx);
    await lightingStore.setLightingBase(getCurrentLightingStatus.value, getCurrentLightingLamp.value);
  };

  const handleChangeColorPicker = async (data: string, idx: number) => {
    let hex = data.replace(/^#/, '');
    // 将3位色值转换为6位
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    lightingStore.updateSelectStaticColor(idx);
    await lightingStore.setLightingPalette();
    await lightingStore.setLightingBase(getCurrentLightingStatus.value, getCurrentLightingLamp.value);
  };

  return {
    handleLuminanceChange,
    handleSpeedChange,
    handleLightDynamicModeChange,
    onChangeLight,
    ChangeColor,
    handleChangeColorPicker,
  };
}
