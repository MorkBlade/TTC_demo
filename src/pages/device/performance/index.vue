<template>
  <div class="device-performance">
    <div class="device-performance-head">
      <div
        class="device-performance-title"
        :data-id="0"
        :class="{ 'is-active': performanceTab === 0, 'is-disabled': isCalibrating }"
        @click="!isCalibrating && onChangeTab(0)"
      >
        {{ t('messages.triggerSetting') }}
      </div>
      <!-- <div
        class="device-performance-title"
        :data-id="1"
        :class="{ 'is-active': performanceTab === 1 }"
        @click="onChangeTab"
      >
        快速触发
      </div> -->
      <div
        class="device-performance-title"
        :data-id="2"
        :class="{ 'is-active': performanceTab === 2, 'is-disabled': isCalibrating }"
        @click="!isCalibrating && onChangeTab(2)"
      >
        {{ t('messages.deadZoneSetting') }}
      </div>
      <div
        class="device-performance-title"
        :data-id="3"
        :class="{ 'is-active': performanceTab === 3, 'is-disabled': isCalibrating }"
        @click="!isCalibrating && onChangeTab(3)"
      >
        {{ t('messages.axisSettingTab') }}
      </div>
      <div
        class="device-performance-title"
        :data-id="4"
        :class="{ 'is-active': performanceTab === 4 }"
        @click="onChangeTab(4)"
      >
        {{ t('messages.calibrationSetting') }}
      </div>
    </div>
    <div class="device-performance-body">
      <device-performance-form :tab-num="performanceTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevicePerformance' });

// import { useKeyboardStore } from '@/store';
import emitter from '@/utils/app-emitter';
import { usePerformanceStore, useConfigStore } from '@/store';
import { t } from '@/locales';
import DevicePerformanceForm from './components/Form.vue';

// const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const configStore = useConfigStore();
const { performanceTab } = storeToRefs(performanceStore);
const isCalibrating = ref(false);
const onChangeTab = (data) => {
  performanceTab.value = Number(data);
};
emitter.on('isCalibrationing', (data) => {
  if (data) {
    isCalibrating.value = true;
    configStore.setActiveMenuAndDisableOthers('performance');
  } else {
    isCalibrating.value = false;
    configStore.setAllEnabledMenu();
  }
});

onBeforeUnmount(() => {
  performanceTab.value = 0;
  configStore.setAllEnabledMenu();
});
</script>

<style scoped lang="less">
@import './index.less';
</style>
