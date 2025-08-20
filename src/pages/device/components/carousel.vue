<template>
  <div class="carousel-box" :style="{ marginLeft: `${offset}px`, width: `${width}px` }">
    <template v-if="carouselData.length === 1">
      <div class="single-axis">
        <template v-if="carouselData[0].image_url === '#'">
          <img :src="axisIcon1" alt="" draggable="false" />
        </template>
        <template v-else>
          <img :src="carouselData[0].src || carouselData[0].image_url" alt="" draggable="false" />
        </template>
        <p :style="{ color: carouselData[0].axis_color }">{{ carouselData[0].axis_name }}</p>
        <p :style="{ color: carouselData[0].axis_color }">({{ carouselData[0].drive_range }}mm)</p>
      </div>
      <div class="bottom-taskbar">
        <div v-if="showText" class="bottom-taskbar__text">
          <span
            :style="{
              backgroundColor:
                localCarouselData[currentIdx]?.color || localCarouselData[currentIdx]?.axis_color || '#fff',
            }"
            @click="handleClick"
          >
            应用
          </span>
        </div>
      </div>
    </template>
    <template v-else-if="carouselData.length < 3">
      <div class="left-arrow" @click="prevClickAlone"></div>
      <div class="shadow" :style="{ cursor: 'auto' }">
        <div
          class="carousel"
          :class="noTransition ? 'no-transition' : ''"
          :style="{ transform: `translateX(${offsetVal}px)` }"
        >
          <div
            v-for="(item, index) in carouselData"
            :key="item.src"
            :class="{ selected: currentIdx === index }"
            :data-id="item.id"
            class="slide"
          >
            <template v-if="item.image_url === '#'">
              <img :src="axisIcon1" alt="" draggable="false" />
            </template>
            <template v-else>
              <img :src="item.src || item.image_url" alt="" draggable="false" />
            </template>
            <p :style="{ color: item.axis_color }">{{ item.axis_name }}</p>
            <p :style="{ color: item.axis_color }">({{ item.drive_range }}mm)</p>
          </div>
        </div>
      </div>
      <div class="right-arrow" @click="nextClickAlone"></div>
      <div class="bottom-taskbar" :style="{ width: `${width}px` }">
        <div v-if="showText" class="bottom-taskbar__text">
          <span
            :style="{
              backgroundColor: carouselData[currentIdx]?.color || carouselData[currentIdx]?.axis_color || '#fff',
            }"
            @click="handleClick"
          >
            应用
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="left-arrow" @click="prevClickSlide"></div>
      <div class="shadow" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag">
        <div
          class="carousel"
          :class="noTransition ? 'no-transition' : ''"
          :style="{ transform: `translateX(${offsetVal}px)` }"
        >
          <div
            v-for="(item, index) in localCarouselData"
            :key="item.src"
            :class="{ selected: currentIdx === index }"
            :data-id="item.id"
            class="slide"
          >
            <template v-if="item.image_url === '#'">
              <img :src="axisIcon1" alt="" draggable="false" />
            </template>
            <template v-else>
              <img :src="item.src || item.image_url" alt="" draggable="false" />
            </template>
            <p :style="{ color: item.axis_color }">{{ item.axis_name }}</p>
            <p :style="{ color: item.axis_color }">({{ item.drive_range }}mm)</p>
          </div>
        </div>
      </div>
      <div class="right-arrow" @click="nextClickSlide"></div>
      <div class="bottom-taskbar">
        <div v-if="showText" class="bottom-taskbar__text">
          <span
            :style="{
              backgroundColor:
                localCarouselData[currentIdx]?.color || localCarouselData[currentIdx]?.axis_color || '#fff',
            }"
            @click="handleClick"
          >
            应用
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { MessagePlugin } from 'tdesign-vue-next';
import axisIcon1 from '@/assets/images/wanciwang.webp';

const { carouselData, offset, selectedId } = defineProps({
  carouselData: { type: Array, default: () => [] },
  width: { type: Number, default: 1030 },
  offset: { type: Number, default: 160 },
  showText: { type: Boolean, default: false },
  selectedId: { type: Number, default: 0 },
});

const emits = defineEmits(['handleSave', 'handleChangeItem']);

const SLIDE_WIDTH = ref(175);
const currentIdx = ref(3);
const offsetVal = ref(0);
const noTransition = ref(false);

const originalLength = computed(() => carouselData.length);
const localCarouselData = computed(() => [...carouselData.slice(-3), ...carouselData, ...carouselData.slice(0, 3)]);
let flag = false;
// 左箭头
const prevClickSlide = () => {
  if (flag) return;
  flag = true;
  currentIdx.value--;
  offsetVal.value += SLIDE_WIDTH.value;
  noTransition.value = false;

  // 当到达前面添加的项时需要跳转
  if (currentIdx.value === 1) {
    setTimeout(() => {
      noTransition.value = true;
      // 跳转到原数组的最后一项（位置在 原数组长度+3-1）
      currentIdx.value = originalLength.value + 1;
      // 计算对应的偏移量
      offsetVal.value = -(SLIDE_WIDTH.value * (originalLength.value - 1));
    }, 500);
  }
  emits(
    'handleChangeItem',
    localCarouselData.value[currentIdx.value]?.id || localCarouselData.value[currentIdx.value]?.axis_id,
  );
  setTimeout(() => {
    flag = false;
  }, 300);
};

// 右箭头
const nextClickSlide = () => {
  if (flag) return;
  flag = true;
  currentIdx.value++;
  offsetVal.value -= SLIDE_WIDTH.value;
  noTransition.value = false;

  // 当到达后面添加的项时需要跳转
  if (currentIdx.value >= originalLength.value + 2) {
    setTimeout(() => {
      noTransition.value = true;
      // 跳转回到原数组的第一项（位置在索引3）
      currentIdx.value = 2;
      // 重置偏移量
      // offsetVal.value = -(SLIDE_WIDTH * 3);
      offsetVal.value = 0;
    }, 500);
  }
  // console.log('handleChangeItem', localCarouselData.value, currentIdx.value, localCarouselData.value[currentIdx.value]);
  emits(
    'handleChangeItem',
    localCarouselData.value[currentIdx.value]?.id || localCarouselData.value[currentIdx.value]?.axis_id,
  );
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('next click', currentIdx.value, localCarouselData.value[currentIdx.value]);
};

// 两个轴的时候
const prevClickAlone = () => {
  if (!currentIdx.value) {
    MessagePlugin.warning('当前是第一个');
    return;
  }
  if (flag) return;
  flag = true;
  currentIdx.value--;
  offsetVal.value += SLIDE_WIDTH.value + 85;
  noTransition.value = false;

  emits('handleChangeItem', carouselData[currentIdx.value]?.id || carouselData[currentIdx.value]?.axis_id);
  setTimeout(() => {
    flag = false;
  }, 300);
};

// 两个轴的时候
const nextClickAlone = () => {
  if (currentIdx.value) {
    MessagePlugin.warning('当前是最后一个');
    return;
  }
  if (flag) return;
  flag = true;
  currentIdx.value++;
  offsetVal.value -= SLIDE_WIDTH.value + 85;

  noTransition.value = false;

  emits('handleChangeItem', carouselData[currentIdx.value]?.id || carouselData[currentIdx.value]?.axis_id);
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('next click', currentIdx.value, localCarouselData.value[currentIdx.value]);
};

// 应用的按钮
const handleClick = () => {
  if (carouselData.length === 1) {
    emits('handleSave', carouselData[0].axis_id || carouselData[0].id);
  }
  if (carouselData.length === 2) {
    emits('handleSave', carouselData[currentIdx.value].axis_id || carouselData[currentIdx.value].id);
  }
  if (carouselData.length >= 3) {
    emits(
      'handleSave',
      localCarouselData.value[currentIdx.value].axis_id || localCarouselData.value[currentIdx.value].id,
    );
  }
};

watchEffect(() => {
  if (carouselData.length < 5 && carouselData.length > 2) {
    currentIdx.value = 2;
    offsetVal.value = 0;
  } else if (carouselData.length < 3) {
    SLIDE_WIDTH.value = 85;
    currentIdx.value = selectedId;
    if (!selectedId) {
      offsetVal.value = 170;
    } else {
      offsetVal.value = SLIDE_WIDTH.value * (selectedId - 1);
    }
  } else {
    currentIdx.value = selectedId + 3;
    offsetVal.value = -(SLIDE_WIDTH.value * (selectedId + 1));
  }
  if (carouselData.length === 1) {
    emits('handleChangeItem', carouselData[0]?.id || carouselData[0]?.axis_id);
  } else {
    emits(
      'handleChangeItem',
      localCarouselData.value[currentIdx.value]?.id || localCarouselData.value[currentIdx.value]?.axis_id,
    );
  }
});

// 初始化

const isDragging = ref(false);
const startX = ref(0);
const dragOffset = ref(0);

const startDrag = (e) => {
  if (flag) return;
  isDragging.value = true;
  startX.value = e.clientX;
  dragOffset.value = 0;
  noTransition.value = true;
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const currentX = e.clientX;
  const diff = currentX - startX.value;
  dragOffset.value = diff;
};

const endDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  noTransition.value = false;

  // 如果拖动距离超过50px，则触发切换
  if (Math.abs(dragOffset.value) > 50) {
    if (dragOffset.value > 0) {
      prevClickSlide();
    } else {
      nextClickSlide();
    }
  }
  dragOffset.value = 0;
};
</script>

<style scoped lang="less">
.carousel-box {
  width: 900px;
  height: 230px;
  display: flex;
  justify-content: center;
  position: relative;

  .left-arrow,
  .right-arrow {
    width: 28px;
    height: 28px;
    margin-top: 105px;
    cursor: pointer;
    background-image: url('@/assets/images/arrow.svg');
    background-size: cover;
    background-repeat: no-repeat;

    &:hover {
      background-image: url('@/assets/images/arrow_clicked.svg');
    }
  }

  .left-arrow {
    transform: rotate(180deg);
  }

  .shadow {
    width: var(--carousel-shadow-width);
    display: flex;
    justify-content: center;
    overflow: hidden;
    cursor: grab;

    .carousel {
      width: 900px;
      display: flex;
      align-items: center;
      margin-right: 75px;
      box-sizing: border-box;
      padding-left: 65px;
      transition: transform 0.5s ease;

      .slide {
        width: 100px;
        height: 100px;
        // overflow: hidden;
        margin-left: 75px;
        flex-shrink: 0;
        border: 2px solid #707070;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;

        &::before {
          content: '';
          width: 107%;
          height: 107%;
          position: absolute;
          top: -5px;
          left: -5px;
          border-radius: 7px;
          border: 2px solid #707070;
        }

        &:first-child {
          margin-left: 0;
        }

        img {
          width: 50px;
          height: 50px;
          object-fit: fill;
        }

        p {
          line-height: 1.3;
          font-size: 14px !important;
        }

        &.selected {
          width: 150px;
          height: 150px;

          &::before {
            width: 108%;
            height: 108%;
            top: -6px;
            left: -7px;
            border-radius: 8px;
          }

          p {
            line-height: 28px;
          }
        }
      }

      &.no-transition {
        transition: none;
      }
    }
  }

  .single-axis {
    width: 150px;
    height: 150px;
    overflow: hidden;
    margin-top: 40px;
    margin-left: 25px;
    font-size: 14px;
    flex-shrink: 0;
    background-image: url('@/assets/images/check_item.svg');
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
      width: 50px;
      height: 50px;
      object-fit: fill;
    }
  }

  .bottom-taskbar {
    position: absolute;
    top: 230px;
    display: flex;
    align-items: center;
    justify-content: center;

    &__text {
      width: 200px;
      display: flex;
      justify-content: center;

      span {
        display: inline-block;
        height: 25px;
        line-height: 25px;
        text-align: center;
        padding: 0 40px;
        border-radius: 12px;
        color: #000;
        font-size: 12px;
        cursor: pointer;
      }
    }
  }
}
</style>
