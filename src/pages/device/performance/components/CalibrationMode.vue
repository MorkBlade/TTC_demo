<template>
  <div class="calibration-mode">
    <div class="calibration-mode-header">
      <h3>{{ t('messages.keyboardAdjusting') }}</h3>
      <t-switch v-model="enabled" @change="handleEnabledChange" />
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: 'DeviceCalibrationMode' });

import { onMounted, onUnmounted, ref } from 'vue';
import { NotifyPlugin } from 'tdesign-vue-next';

import echarts from '@/config/echarts/index';
import { t } from '@/locales';
import { usePerformanceStore } from '@/store';
import emitter from '@/utils/app-emitter';

const performanceStore = usePerformanceStore();
const enabled = ref(false);

const chartRef = ref(null);
const chartInstance = ref<any>(null);
const notification = ref(null);

const isCalibrating = ref(false);
let calibrationTimer: number | null = null;

const chartData = ref<[number, number][]>([]);
const count = ref(0);
const isCalibratingSuccessTip = ref(false);

const option = {
  animation: false,
  tooltip: { trigger: 'none' },
  grid: { left: 30, right: 30, top: 40, bottom: 40, containLabel: true },
  xAxis: {
    type: 'value',
    min: 0,
    max: 200,
    axisLabel: { show: false },
    axisLine: { lineStyle: { color: '#666' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 4,
    interval: 0.5,
    axisLabel: { formatter: '{value} mm', color: '#999' },
    axisLine: { lineStyle: { color: '#666' } },
    splitLine: { show: false },
  },
  series: [
    {
      name: t('messages.realTimeTravel'),
      type: 'line',
      showSymbol: false,
      smooth: 0.3,
      animation: true,
      progressive: 300,
      progressiveThreshold: 400,
      lineStyle: { width: 2, color: '#409EFF' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64,158,255,0.2)' },
            { offset: 1, color: 'rgba(64,158,255,0)' },
          ],
        },
      },
      data: [],
    },
  ],
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);

  if (chartRef.value) {
    chartInstance.value = echarts.init(chartRef.value);
    chartInstance.value.setOption(option);
  }

  window.onresize = () => {
    console.log('window.onresize');
    if (chartInstance.value) {
      chartInstance.value.setOption(option);
      chartInstance.value?.resize();
    }
  };
});

const handleEnabledChange = async (value: boolean) => {
  if (notification.value) {
    NotifyPlugin.close(notification.value);
    notification.value = null;
  }
  emitter.on('isCalibration', (data) => {
    if (!data && value) {
      // MessagePlugin.success('校准成功');
      isCalibratingSuccessTip.value = true;
    } else {
      isCalibratingSuccessTip.value = false;
    }
  });

  emitter.emit('isCalibrationing', value);

  if (value) {
    notification.value = NotifyPlugin('info', { title: t('messages.startCalibration') });

    try {
      await performanceStore.calibrationStart();
      chartData.value = [];
      count.value = 0;
      isCalibrating.value = true;
      startCalibrationLoop();
    } catch (err) {
      console.error('校准开始失败:', err);
      isCalibrating.value = false;
    }
  } else {
    await stopCalibrationLoop();
    if (isCalibratingSuccessTip.value) {
      notification.value = NotifyPlugin('success', { title: t('messages.calibrationComplete') });
    }
  }
};

const startCalibrationLoop = () => {
  const loop = async () => {
    if (!isCalibrating.value) return;

    try {
      const { max } = await performanceStore.getRm6X21Calibration();
      option.series[0].data.push([count.value, max]);

      if (count.value > 200) {
        option.xAxis.max = count.value;
        option.xAxis.min = count.value - 200;
      }

      count.value++;

      if (option.series[0].data.length > 200) {
        option.series[0].data.shift();
      }
      if (chartInstance.value) {
        chartInstance.value.setOption(option);
      }
    } catch (err) {
      console.warn('获取校准数据失败:', err);
    }

    calibrationTimer = window.setTimeout(loop, 10);
  };

  loop();
};

const stopCalibrationLoop = async () => {
  if (calibrationTimer !== null) {
    clearTimeout(calibrationTimer);
    calibrationTimer = null;
  }

  if (isCalibrating.value) {
    try {
      await performanceStore.calibrationEnd();
      // 清空图表数据
      option.series[0].data = [];
      count.value = 0;
      option.xAxis.min = 0;
      option.xAxis.max = 200;
      if (chartInstance.value) {
        chartInstance.value.setOption(option);
      }
    } catch (err) {
      console.warn('校准结束失败:', err);
    }
  }

  isCalibrating.value = false;
};

const handleBeforeUnload = () => {
  stopCalibrationLoop();
};

onUnmounted(() => {
  stopCalibrationLoop();
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style lang="less" scoped>
@import './style/CalibrationMode.less';
</style>
