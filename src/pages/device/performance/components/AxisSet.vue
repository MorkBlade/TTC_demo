<template>
  <div class="device-performance-page__axis">
    <div class="device-performance-page__axis-left">
      <div
        v-for="(item, index) in getCurrentAxisGroup"
        :key="index"
        class="factory-btn"
        :class="{ active: currentFactory === item.type }"
        @click="currentFactory = item.type"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="device-performance-page__axis-right">
      <div v-for="(item, index) in axisList" :key="item.axis_id" class="axis-item" @click="selectAxis(index, item)">
        <div :class="[{ 'axis-item-active': currentAxis === index }]">
          <div>
            <img src="https://img.js.design/assets/img/67d3e811791458ad149d2f28.png#39501edbb12f7ad56b8e4bdef3fab17b" />
          </div>
        </div>
        <p :style="{ color: item.axis_color, marginTop: '8px' }">{{ item.axis_name }}</p>
        <p :style="{ color: item.axis_color, marginTop: '8px' }">({{ item.drive_range || item.axis_range_max }}mm)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DevicePerformanceForm' });

import { storeToRefs } from 'pinia';
import { useKeyboardStore, usePerformanceStore } from '@/store';
// import mCarousel from '@/pages/device/components/carousel.vue';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboardLayout, activeKeys } = storeToRefs(keyboardStore);
const { getCurrentAxisGroup, isAxisStatus } = storeToRefs(performanceStore);

const currentAxis = ref(0);
const currentFactory = ref('GATERON');
const axisObj = computed(() => {
  const { axisList } = performanceStore;

  return axisList.reduce((acc, item) => {
    const id = item.aixsDetail[0].axis_id;
    acc[id] = item;
    return acc;
  }, {});
});
const axisID = ref(0);
watch(
  [() => activeKeys.value, () => performanceStore.axisList],
  () => {
    if (activeKeys.value.length === 0) {
      axisID.value = 0;
      return;
    }

    // 解构获取最后一个激活键的坐标
    const [rowIndexStr, colIndexStr] = String(activeKeys.value.at(-1)).split('-');
    const rowIndex = Number(rowIndexStr);
    const colIndex = Number(colIndexStr);

    // 安全获取轴配置
    const axisConfig =
      isAxisStatus.value === 'v2'
        ? keyboardLayout.value[rowIndex]?.[colIndex]?.performance?.axisV2Id
        : keyboardLayout.value[rowIndex]?.[colIndex]?.performance?.axis;
    if (axisConfig === undefined) {
      axisID.value = 0;
      return;
    }

    // 获取当前轴品牌和轴列表
    const targetAxis = isAxisStatus.value === 'v2' ? axisObj.value[axisConfig] : performanceStore.axisList[axisConfig];
    currentFactory.value = targetAxis.brand;

    // 筛选并查找索引
    const brandAxes = performanceStore.axisList.filter((item) => item.brand === currentFactory.value);

    axisID.value = brandAxes.findIndex((item) => item.axis_id === targetAxis.axis_id);
  },
  { deep: true }, // 如需深度监听
);

const axisList = computed(() => {
  return performanceStore.axisList.filter((ite) => {
    if (currentFactory.value === 'other') {
      return ite.brand === 'other' || ite.brand === '';
    }
    return ite.brand === currentFactory.value;
  });
});

const selectAxis = async (index, item) => {
  currentAxis.value = index;

  if (activeKeys.value.length > 0) {
    const promises = [];
    for (let i = 0; i < activeKeys.value.length; i++) {
      const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));

      if (isAxisStatus.value === 'v2') {
        const targetAxis = axisList.value[index];
        // TODO:需要统一V2的axisId和axisV2Id字段
        keyboardLayout.value[row][col].performance.axisV2Id = targetAxis.aixsDetail[0].axis_id - 0;
        // keyboardLayout.value[row][col].performance.axisId = targetAxis.axis_id - 0;
        keyboardLayout.value[row][col].performance.axisRangeMax = targetAxis.aixsDetail[0].axis_range_max - 0;
        keyboardLayout.value[row][col].performance.axisCoefficient = targetAxis.aixsDetail[0].axis_coefficient - 0;
      } else {
        keyboardLayout.value[row][col].performance.axis = item.axisIndex;
      }
      const {
        calibrate,
        axis,
        mode,
        normalPress,
        rtFirstTouch,
        normalRelease,
        rtPress,
        rtRelease,
        pressDeadStroke,
        releaseDeadStroke,
        axisV2Id,
        axisRangeMax,
        axisCoefficient,
      } = keyboardLayout.value[row][col].performance;
      // 新增参数

      const params = {
        row,
        col,
        mode,
        normalPress,
        normalRelease,
        rtFirstTouch,
        rtPress,
        rtRelease,
        pressDeadStroke,
        releaseDeadStroke,
        axis,
        calibrate,
        axisV2Id,
        axisRangeMax,
        axisCoefficient,
      };
      promises.push(performanceStore.setPerformance(params));
    }
    await Promise.all(promises);
  }
};
</script>

<style scoped lang="less">
.device-performance-page__axis {
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 70%;

  & .axis-item {
    width: 86px;
    height: 120px;
    &.axis-item-active {
      border: 1px solid var(--td-brand-color);
    }

    & div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: rgb(41 42 46 / 100%);
      border: 1px solid rgb(112 112 112 / 100%);
      border-radius: 4px;
      cursor: pointer;
      opacity: 1;

      img {
        width: 63px;
        height: 57px;
        object-fit: fill;
      }
    }

    span {
      display: inline-block;
      width: 80px;
      margin: 8px 0;
      color: rgb(255 218 186 / 100%);
      font-weight: 700;
      font-size: 9px;
      line-height: 10.55px;
      letter-spacing: 0;
      text-align: center;
      vertical-align: top;
    }

    p {
      color: #fff;
      font-weight: 700;
      font-size: 10px;
      line-height: 11.72px;
      letter-spacing: 0;
      text-align: center;
      vertical-align: top;
    }

    & + .axis-item {
      margin-bottom: 10px;
    }
  }
}

.device-performance-page__axis-left {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden auto;
  padding-right: 20px;
  flex-shrink: 0;
  // 好看的滚动条
  &::-webkit-scrollbar {
    width: 4px;
    height: 0;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: var(--td-bg-color-component);
  }

  .factory-btn {
    width: 120px;
    border-radius: 20px;
    padding: 8px 16px;
    text-align: center;
    background-color: var(--td-bg-color-component);
    color: var(--td-text-color-primary);
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background-color: var(--td-brand-color-active);
      color: var(--td-text-color-primary);
    }

    &:hover {
      background-color: var(--td-brand-color-hover);
      color: var(--td-text-color-primary);
    }
  }

  .factory-btn + .factory-btn {
    margin-top: 10px;
  }
}

.device-performance-page__axis-right {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden auto;
  padding: 0 10px;
  // 好看的滚动条
  &::-webkit-scrollbar {
    width: 4px;
    height: 0;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: var(--td-bg-color-component);
  }
}
</style>
