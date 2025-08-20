<template>
  <div class="carousel-container">
    <button v-if="list.length > 1" class="arrow left" :disabled="isTransitioning" @click="scrollLeft">‹</button>

    <div ref="wrapperRef" class="carousel-wrapper">
      <div
        ref="carouselRef"
        class="carousel"
        :style="{ transform: `translateX(${offset}px)` }"
        @transitionend="onTransitionEnd"
      >
        <div
          v-for="(item, index) in list"
          :key="item.id"
          class="carousel-item"
          :class="{
            active: isActive(index),
            side: isSide(index),
          }"
          @click="selectItem(index)"
        >
          <img :src="`/placeholder.svg?height=60&width=60&text=${item.label}`" :alt="item.label" />
          <div class="label">{{ item.label }}</div>
          <div class="size">{{ item.size }}</div>
        </div>
      </div>
    </div>

    <button v-if="list.length > 1" class="arrow right" :disabled="isTransitioning" @click="scrollRight">›</button>

    <button class="apply-btn">应用</button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  list: {
    type: Array,
    default: () => [
      { id: 'axle-a', label: '自定义轴A', size: '(3.0mm)', img: 'imgA.png' },
      { id: 'axle-b', label: '自定义轴B', size: '(3.5mm)', img: 'imgB.png' },
      { id: 'axle-c', label: '自定义轴C', size: '(3.2mm)', img: 'imgC.png' },
    ],
    required: true,
  },
  modelValue: {
    type: String, // v-model 绑定当前选中项的 id
    default: 'axle-b',
  },
});

const emit = defineEmits(['update:modelValue']);

const wrapperRef = ref(null);
const carouselRef = ref(null);
const itemWidth = 140;
const itemGap = 20; // 项目之间的间距
const itemTotalLayoutWidth = itemWidth + itemGap; // 项目占据的完整宽度 (itemWidth + gap)

const offset = ref(0);
// currentVisualIndex 是一个可以超出实际列表范围的索引，用于驱动无限滚动时的视觉位置
const currentVisualIndex = ref(0);
const isTransitioning = ref(false);

// 辅助函数：获取循环后的真实索引
const getWrappedIndex = (idx, count) => {
  return ((idx % count) + count) % count;
};

// 判断项目是否为当前激活项
const isActive = (indexInPropsList) => {
  return indexInPropsList === getWrappedIndex(currentVisualIndex.value, props.list.length);
};

// 判断项目是否为侧边项（非激活但可见）
const isSide = (indexInPropsList) => {
  const count = props.list.length;
  if (count <= 1) return false;

  const realActive = getWrappedIndex(currentVisualIndex.value, count);
  const prevReal = getWrappedIndex(realActive - 1, count);
  const nextReal = getWrappedIndex(realActive + 1, count);

  return indexInPropsList === prevReal || indexInPropsList === nextReal;
};

// 计算给定视觉索引的偏移量
const calculateOffset = (visualIdx) => {
  const count = props.list.length;
  const wrapperWidth = wrapperRef.value?.offsetWidth || 460; // 使用实际的 wrapper 宽度

  if (count === 0) return 0;
  if (count === 1) {
    // 单个项目居中显示
    return (wrapperWidth - itemWidth) / 2;
  }

  // 多个项目：确保目标视觉索引的项目在 carousel-wrapper 正中心
  const targetItemCenter = visualIdx * itemTotalLayoutWidth + itemWidth / 2;
  const wrapperCenter = wrapperWidth / 2;
  return wrapperCenter - targetItemCenter;
};

// 滚动轮播图到指定视觉索引
const scrollCarousel = (targetVisualIndex, withTransition = true) => {
  if (!carouselRef.value || props.list.length === 0) return;

  if (withTransition) {
    isTransitioning.value = true;
    carouselRef.value.style.transition = 'transform 0.4s ease';
  } else {
    carouselRef.value.style.transition = 'none';
  }

  offset.value = calculateOffset(targetVisualIndex);
  currentVisualIndex.value = targetVisualIndex;

  // 更新 v-model
  const realIndex = getWrappedIndex(currentVisualIndex.value, props.list.length);
  emit('update:modelValue', props.list[realIndex]?.id || null);
};

// 动画结束时的处理
const onTransitionEnd = () => {
  isTransitioning.value = false;

  const count = props.list.length;
  if (count <= 1) return;

  // 计算当前视觉索引对应的真实索引
  const realIdx = getWrappedIndex(currentVisualIndex.value, count);

  // 如果视觉索引超出了“中间”区域，则无动画地跳回对应的中间区域索引
  // 例如，如果列表有3项，我们希望视觉索引在 [3, 5] 之间循环
  // 如果 currentVisualIndex 是 6 (对应真实索引 0)，则跳回 3
  // 如果 currentVisualIndex 是 2 (对应真实索引 2)，则跳回 5
  const middleRangeStart = count; // 假设中间区域从 count 开始
  const middleRangeEnd = count * 2 - 1; // 假设中间区域到 2*count - 1 结束

  if (currentVisualIndex.value < middleRangeStart || currentVisualIndex.value > middleRangeEnd) {
    const newVisualIndex = realIdx + middleRangeStart; // 跳回中间区域的对应索引
    carouselRef.value.style.transition = 'none';
    offset.value = calculateOffset(newVisualIndex);
    currentVisualIndex.value = newVisualIndex;
  }
};

// 向左滚动
const scrollLeft = () => {
  if (isTransitioning.value || props.list.length <= 1) return;
  scrollCarousel(currentVisualIndex.value - 1, true);
};

// 向右滚动
const scrollRight = () => {
  if (isTransitioning.value || props.list.length <= 1) return;
  scrollCarousel(currentVisualIndex.value + 1, true);
};

// 点击项目时选中
const selectItem = (indexInPropsList) => {
  if (isTransitioning.value || props.list.length === 0) return;

  const count = props.list.length;
  let targetVisualIndex = indexInPropsList;

  // 如果列表项多于1个，尝试将目标索引定位到“中间”区域
  if (count > 1) {
    const currentRealIndex = getWrappedIndex(currentVisualIndex.value, count);
    const currentVisualOffset = currentVisualIndex.value - currentRealIndex; // 当前视觉索引与真实索引的差值 (例如，3, 6, 9...)
    targetVisualIndex = indexInPropsList + currentVisualOffset;

    // 确保点击后，目标视觉索引在合理的“中间”区域附近，避免跳到很远的地方
    // 例如，如果当前在 visualIndex 3 (real 0)，点击 realIndex 2，目标 visualIndex 5
    // 如果当前在 visualIndex 4 (real 1)，点击 realIndex 0，目标 visualIndex 3
    // 确保目标视觉索引与当前视觉索引的距离最小化，以避免不必要的长距离滚动
    const diff = targetVisualIndex - currentVisualIndex.value;
    if (Math.abs(diff) > count / 2 && count > 1) {
      if (diff > 0) {
        targetVisualIndex -= count;
      } else {
        targetVisualIndex += count;
      }
    }
  }

  scrollCarousel(targetVisualIndex, true);
};

// 监听 modelValue 变化，从外部控制轮播
watch(
  () => props.modelValue,
  (newValueId) => {
    if (!newValueId) {
      currentVisualIndex.value = -1; // 如果外部设置为null，则没有选中项
      return;
    }
    const count = props.list.length;
    if (count === 0) return;

    const realIndex = props.list.findIndex((item) => item.id === newValueId);
    if (realIndex === -1) return; // 找不到对应项

    // 计算目标视觉索引，使其位于“中间”区域
    let targetVisualIndex = realIndex;
    if (count > 1) {
      // 尝试将目标视觉索引定位到当前视觉索引附近的“中间”区域
      const currentRealIndex = getWrappedIndex(currentVisualIndex.value, count);
      const currentVisualOffset = currentVisualIndex.value - currentRealIndex;
      targetVisualIndex = realIndex + currentVisualOffset;

      // 调整 targetVisualIndex，使其尽可能接近 currentVisualIndex，避免长距离跳跃
      const diff = targetVisualIndex - currentVisualIndex.value;
      if (Math.abs(diff) > count / 2 && count > 1) {
        if (diff > 0) {
          targetVisualIndex -= count;
        } else {
          targetVisualIndex += count;
        }
      }
    }

    if (currentVisualIndex.value !== targetVisualIndex) {
      nextTick(() => {
        scrollCarousel(targetVisualIndex, false); // 无动画滚动到目标位置
      });
    }
  },
  { immediate: true },
);

// 监听 list prop 变化，重新初始化轮播状态
watch(
  () => props.list,
  (newList, oldList) => {
    // 只有当列表内容实际发生变化时才重新初始化
    if (JSON.stringify(newList) !== JSON.stringify(oldList)) {
      let newActiveRealIndex = -1;
      if (props.modelValue) {
        newActiveRealIndex = newList.findIndex((item) => item.id === props.modelValue);
      }
      if (newActiveRealIndex === -1 && newList.length > 0) {
        newActiveRealIndex = 0; // 默认选中第一个项目
      }

      let newActiveVisualIndex = newActiveRealIndex;
      if (newList.length > 1) {
        // 对于无限滚动，将初始视觉索引定位到“中间”区域
        newActiveVisualIndex = newActiveRealIndex + newList.length;
      }

      nextTick(() => {
        scrollCarousel(newActiveVisualIndex, false); // 无动画滚动到初始位置
      });
    }
  },
  { deep: true },
);
</script>

<style scoped>
.carousel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 600px; /* 增加宽度以容纳箭头 */
  margin: 0 auto;
  background: #1a1a1a;
  background-image: radial-gradient(circle, rgb(255 255 255 / 10%) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 40px 20px;
  border-radius: 12px;
}

.carousel-wrapper {
  overflow: hidden;
  width: 460px; /* 140px * 3 items + 20px * 2 gaps = 460px，完美容纳3个项目 */
  height: 180px;
  position: relative;
  margin: 0 auto; /* 确保在 container 中居中 */
}

.carousel {
  display: flex;
  transition: transform 0.4s ease;
  gap: 20px; /* 使用 gap 来控制项目之间的间距 */
}

.carousel-item {
  flex: 0 0 140px; /* 定义项目的基本宽度 */
  text-align: center;
  border: 2px solid #444;
  border-radius: 12px;
  padding: 16px 12px;
  background: rgb(0 0 0 / 30%);
  transform: scale(0.8); /* 默认缩放，用于侧边项目 */
  transition:
    transform 0.4s ease,
    border-color 0.4s ease,
    color 0.4s ease,
    background 0.4s ease;
  color: #999;
  cursor: pointer; /* 添加指针样式，表示可点击 */
}

.carousel-item img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.carousel-item .label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.carousel-item .size {
  font-size: 12px;
  opacity: 0.8;
}

/* 激活状态 */
.carousel-item.active {
  transform: scale(1); /* 激活项目不缩放 */
  border-color: #faff63;
  color: #faff63;
  background: rgb(250 255 99 / 10%);
}

/* 侧边项目状态 (当不是激活项目时，保持默认的缩放和边框) */
.carousel-item.side {
  border-color: #666;
  color: #ccc;
  background: rgb(0 0 0 / 20%);
}

/* 单个项目时的特殊样式 */
.carousel-container:has(.carousel-item:only-child) .carousel-item {
  transform: scale(1);
  border-color: #faff63;
  color: #faff63;
  background: rgb(250 255 99 / 10%);
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgb(255 255 255 / 10%);
  color: #fff;
  font-size: 24px;
  border: none;
  cursor: pointer;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.arrow:hover:not(:disabled) {
  background: rgb(255 255 255 / 20%);
}

.arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.left {
  left: calc(50% - 230px - 50px); /* 50% of container - half of wrapper width (460/2=230) - arrow offset */
}

.right {
  right: calc(50% - 230px - 50px); /* 50% of container - half of wrapper width (460/2=230) - arrow offset */
}

.apply-btn {
  margin-top: 30px;
  padding: 10px 30px;
  background: #ecff63;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  color: #000;
}

.apply-btn:hover {
  background: #faff63;
}
</style>
