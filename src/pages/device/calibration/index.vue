<template>
  <div class="calibration-mode">
    <div class="calibration-mode-header">
      <h3>键盘校准</h3>
      <t-switch v-model="enabled" @change="handleEnabledChange" />
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>
<script lang="ts" setup>
import { NotifyPlugin } from 'tdesign-vue-next';

import echarts from '@/config/echarts/index';
import { usePerformanceStore } from '@/store';
import emitter from '@/utils/app-emitter';

const performanceStore = usePerformanceStore();

const enabled = ref(false);

const chartRef = ref(null);
const chartInstance = ref(null);
const keyPressTestCount = ref(0);

const notification = ref(null);
const option = {
  tooltip: {},
  grid: { left: 15, right: 15, top: 30, bottom: 30, containLabel: true },
  xAxis: {
    type: 'value',
    min: 0,
    max: 200,
    axisLabel: { show: false }, // 隐藏刻度
    axisTick: { show: false }, // 隐藏刻度线
  },
  yAxis: { type: 'value', min: 0, max: 4, interval: 0.5, axisLabel: { formatter: '{value}' } }, // 每个刻度为1000
  series: [{ name: '实时行程', type: 'line', showSymbol: false, data: [] }], // 隐藏数据点的圆圈
};

onMounted(() => {
  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value);
    chartInstance.value.setOption(option);
  }
});

const handleEnabledChange = async (value) => {
  // 和键盘说我要开始校准了
  if (notification.value) {
    NotifyPlugin.close(notification.value);
    notification.value = null;
  }
  if (value) {
    performanceStore.calibrationStart();
    notification.value = NotifyPlugin('info', { title: '开始校准' });
  } else {
    notification.value = NotifyPlugin('success', { title: '结束校准' });
    performanceStore.calibrationEnd();
  }
  emitter.emit('calibration-mode', { value });
  keyPressTestCount.value++;
};

// watch(keyPressTestCount, async () => {
//   if (enabled.value) {
//     let mmBuff = 0;
//     const { max } = await performanceStore.getADCSample(0);
//     mmBuff = max;
//     option.series[0].data.push([count.value, mmBuff]);

//     if (count.value > 200) {
//       // x轴范围向右移动
//       option.xAxis.max = count.value;
//       option.xAxis.min = count.value - 200;
//     }

//     count.value++;

//     if (option.series[0].data.length > 200) {
//       option.series[0].data.shift(); // 移除数组中的第一个元素
//     }
//     if (chartInstance.value) {
//       chartInstance.value.setOption(option);
//     }
//     keyPressTestCount.value++;
//   }
// });

onUnmounted(() => {
  if (enabled.value) {
    performanceStore.calibrationEnd();
    enabled.value = false;
  }
});
</script>

<style scoped lang="less">
.calibration-mode {
  background-color: #fff;

  &-header {
    display: flex;
    align-items: center;

    h3 {
      margin-right: 15px;
    }
  }

  .chart-container {
    width: 600px;
    height: 330px;
    margin: 0 auto;
  }
}
</style>
