<template>
  <div class="calibration-mode-box fade-in">
    <div class="calibration-mode-title">
      <div>
        <span>校准说明</span>
        <p style="font-size: 0.75rem; color: #808080">校准时请完全按下按键保持1到2秒，同时上下左右轻微摇晃按键。</p>
      </div>
      <div
        class="start-btn"
        :class="switchClass"
        @click="onStart"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <span>{{ isStart ? '结束校验' : '开始校验' }}</span>
      </div>
    </div>
    <div class="calibration-mode-box-wrap">
      <div class="left-box">
        <div style="width: 50%">
          <p>1.按下需要校准的按键；</p>
          <img :src="KCbg" alt="" style="margin-left: 50px" />
        </div>
        <div style="width: 50%">
          <p>2.长按保持。等待校准；</p>
          <img :src="checkBtn" alt="" style="margin-left: 50px" />
        </div>
        <div style="width: 100%">
          <p>3.查看校准结果。</p>
          <div style="display: flex; justify-content: space-around">
            <img :src="UnBtn" alt="" />
            <img :src="SucBtn" alt="" />
            <img :src="ErroBtn" alt="" draggable="false" />
          </div>
        </div>
      </div>
      <!-- <div class="calibration-mode">
        <div class="calibration-mode-header">
          <h3>{{ t('messages.keyboardAdjusting') }}</h3>
          <t-switch v-model="enabled" @change="handleEnabledChange" />
        </div>
        <div ref="chartRef" class="chart-container"></div>
      </div> -->
      <div class="echarts-box">
        <CalibrationMode v-model:isStart="isStart" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: 'DeviceCalibrationMode' });
import CalibrationMode from './CalibrationMode.vue';

import { onMounted, onUnmounted, ref } from 'vue';
import { NotifyPlugin } from 'tdesign-vue-next';

import echarts from '@/config/echarts/index';
import { t } from '@/locales';
import { usePerformanceStore } from '@/store';
import emitter from '@/utils/app-emitter';

const KCbg = new URL('@/assets/images/keyboard_calibration_bg.svg', import.meta.url).href;
const checkBtn = new URL('@/assets/images/check_btn.svg', import.meta.url).href;
const UnBtn = new URL('@/assets/images/un_btn.svg', import.meta.url).href;
const SucBtn = new URL('@/assets/images/success_btn.svg', import.meta.url).href;
const ErroBtn = new URL('@/assets/images/error_btn.svg', import.meta.url).href;

const performanceStore = usePerformanceStore();
const enabled = ref(false);
const isAct = ref(false);
const isStart = ref(false);

const chartRef = ref(null);
const chartInstance = ref<any>(null);
const notification = ref(null);
const isVersion2 = localStorage.getItem('keyboardVersion') === 'v2';

const isCalibrating = ref(false);
let calibrationTimer: number | null = null;

const switchClass = computed(() => {
  if (isStart.value) {
    return 'is-pending';
  } else if (isAct.value) {
    return 'is-active';
  } else {
    return '';
  }
});

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

const onStart = () => {
  isStart.value = !isStart.value;
  if (!isStart.value) {
    isVersion2.value ? performanceStore.calibrationEndV2() : performanceStore.calibrationEnd();
  }
  isAct.value = false;
};

const onMouseEnter = () => {
  isAct.value = true;
};
const onMouseLeave = () => {
  isAct.value = false;
};

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
