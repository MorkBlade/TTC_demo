<template>
  <div class="device-performance-quick__trigger">
    <div>
      <travelTestCard />
    </div>
    <performance-dead-zone />
    <performance-trigger />
  </div>
</template>

<script setup>
import travelTestCard from './travel-test-card.vue';
import PerformanceDeadZone from './PerformanceDeadZone.vue';
import PerformanceTrigger from './PerformanceTrigger.vue';
</script>

<style lang="less" scoped>
@import './style/PerformanceQuickTrigger.less';
</style>
