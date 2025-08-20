<template>
  <div class="device-performance-page">
    <performance-trigger v-if="tabNum === 0" />
    <performance-dead-zone v-if="tabNum === 2" />
    <axis-set v-if="tabNum === 3" />
    <calibration-mode v-if="tabNum === 4" />
  </div>
</template>

<script setup>
defineOptions({ name: 'DevicePerformanceForm' });

import CalibrationMode from './CalibrationMode.vue';
import PerformanceTrigger from './PerformanceTrigger.vue';
import PerformanceDeadZone from './PerformanceDeadZone.vue';
import AxisSet from './AxisSet.vue';

const { tabNum } = defineProps({
  tabNum: { type: Number, default: 0 },
});
</script>

<style scoped lang="less">
@import './style/Form.less';
</style>
