<template>
  <div class="device-performance-quick__trigger fade-in">
    <travelTestCard />
    <performance-dead-zone />
    <carousel @handleChangeItem="handleChangePreset" />
  </div>
</template>

<script setup>
import { PRESET_SETTINGS } from '@/config/constant/index.js';
import travelTestCard from './travel-test-card.vue';
import PerformanceDeadZone from './PerformanceDeadZone.vue';
import carousel from './carousel.vue';

const checkedPreset = ref(PRESET_SETTINGS[3]);

const handleChangePreset = (id) => {
  checkedPreset.value = PRESET_SETTINGS[id - 1];
};
</script>

<style lang="less" scoped>
@import './style/PerformanceQuickTrigger.less';
</style>
