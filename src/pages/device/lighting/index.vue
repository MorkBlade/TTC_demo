<template>
  <div class="device-lighting">
    <div class="device-lighting-body">
      <device-config-lighting-form class="device-lighting-body__form"></device-config-lighting-form>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'DeviceConfigLighting' });
import { useGlobalStore, useLightingStore } from '@/store';

import DeviceConfigLightingForm from './form.vue';

const lightingStore = useLightingStore();
const globalStore = useGlobalStore();
const { isDoubleLighting } = storeToRefs(globalStore);

// services.on('lightingBase', async (data) => {
//   console.log('lightingBase', data);
//   // const { area } = data;
//   // if (lightingStore.area === area) {
//   lightingStore.updateLightingBaseData(data);
//   // }
// });

onMounted(async () => {
  try {
    // 获取是不是双灯位的
    const lampData = isDoubleLighting.value ? 'DoubleLighting' : 'SingleLighting';
    lightingStore.lamp = lampData;
    await lightingStore.getLightingBase(lampData);
    await lightingStore.getLightingPalette();
    await lightingStore.getLightingColorCorrection();
  } catch (error) {
    console.warn('没有获取到灯光', error);
  }
});

onBeforeUnmount(() => {
  // 清理样式元素
  const styleElement = document.getElementById('keyboard-lighting-styles');
  if (styleElement) {
    styleElement.remove();
  }
});
</script>

<style scoped lang="less">
@import './index.less';
</style>
