<template>
  <div class="device-performance-page">
    <div v-if="tabNum === 1"></div>
    <performance-quick-trigger v-if="tabNum === 0" />
    <performance-mode v-if="tabNum === 2" />
    <axis-set v-if="tabNum === 3" />
    <performance-calibration-mode v-if="tabNum === 4" />
  </div>
</template>

<script setup>
defineOptions({ name: 'DevicePerformanceForm' });

import PerformanceCalibrationMode from './PerformanceCalibrationMode.vue';
import PerformanceQuickTrigger from './PerformanceQuickTrigger.vue';
import PerformanceMode from './PerformanceMode.vue';
import AxisSet from './AxisSet.vue';

const { tabNum } = defineProps({
  tabNum: { type: Number, default: 0 },
});
</script>

<style scoped lang="less">
@import './style/Form.less';
</style>
