<template>
  <div class="device-performance-quick__trigger">
    <div>触发效果演示</div>
    <performance-dead-zone />
    <performance-trigger />
  </div>
</template>

<script setup>
import PerformanceDeadZone from './PerformanceDeadZone.vue';
import PerformanceTrigger from './PerformanceTrigger.vue';
</script>

<style lang="less" scoped>
@import './style/PerformanceQuickTrigger.less';
</style>
