<template>
  <div style="min-width: 42rem">
    <div class="switch-box">
      <p>性能预设:</p>
      <t-switch v-model="rtSwitch" :disabled="!slideable" size="medium" @change="onChangeRT" />
    </div>
    <span style="font-size: 0.75rem; color: #808080; display: block; margin-bottom: 20px"
      >可以根据自身需求选择合适的键盘性能预设，提升您在特定任务中的操作效率与舒适度。</span
    >
    <div class="carousel-box" v-if="rtSwitch" :style="{ marginLeft: `${offset}px`, width: `${width}px` }">
      <template v-if="carouselData.length === 1">
        <div class="single-axis">
          <template v-if="carouselData[0].image_url === '#'">
            <img :src="axisIcon1" alt="" draggable="false" />
          </template>
          <template v-else>
            <img :src="carouselData[0].src || carouselData[0].image_url" alt="" draggable="false" />
          </template>
        </div>
        <div class="bottom-taskbar">
          <div class="bottom-taskbar__text" v-if="showText">
            <span
              :style="{
                backgroundColor: carouselData[0]?.color || carouselData[0]?.axis_color || '#fff',
              }"
            >
              {{ carouselData[0]?.name || carouselData[0]?.axis_name || '磁轴' }}
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
            </div>
          </div>
        </div>
        <div class="right-arrow" @click="nextClickAlone"></div>
        <div class="bottom-taskbar">
          <div class="bottom-taskbar__text" v-if="showText">
            <span
              :style="{
                backgroundColor: carouselData[currentIdx]?.color || carouselData[currentIdx]?.axis_color || '#fff',
              }"
            >
              {{ carouselData[currentIdx]?.name || carouselData[currentIdx]?.axis_name || '磁轴' }}
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
            </div>
          </div>
        </div>
        <div class="right-arrow" @click="nextClickSlide"></div>
        <div class="bottom-taskbar">
          <div class="bottom-taskbar__text" v-if="showText">
            <span
              :style="{
                backgroundColor:
                  localCarouselData[currentIdx]?.color || localCarouselData[currentIdx]?.axis_color || '#fff',
              }"
            >
              {{ localCarouselData[currentIdx]?.name || localCarouselData[currentIdx]?.axis_name || '磁轴' }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { PRESET_SETTINGS } from '@/config/constant/index.js';
import { scaleValue } from '@/utils/responsive.ts';
import { useKeyboardStore } from '@/store';

//import { showMessage } from '@/utils/message';
import axisIcon1 from '@/assets/images/wanciwang.webp';

const { offset } = defineProps({
  width: { type: Number, default: scaleValue(700) },
  offset: { type: Number, default: scaleValue(60) },
  showText: { type: Boolean, default: false },
  selectedId: { type: Number, default: 0 },
});
const emits = defineEmits(['handleSave', 'handleChangeItem']);

// const SLIDE_WIDTH = computed(() => {
//   const value = getComputedStyle(document.documentElement).getPropertyValue('--carousel-offset-x').trim();
//   return parseInt(value, 10);
// });
const keyboardStore = useKeyboardStore();
const { activeKeys } = storeToRefs(keyboardStore);
const slideable = computed(() => {
  return activeKeys.value.length > 0;
});
const carouselData = PRESET_SETTINGS;
const SLIDE_WIDTH = ref(scaleValue(175));
const currentIdx = ref(6);
const offsetVal = ref(0);
const noTransition = ref(false);
const rtSwitch = ref(false);
const originalLength = computed(() => carouselData.length);
const localCarouselData = ref([...carouselData.slice(-3), ...carouselData, ...carouselData.slice(0, 3)]);

// console.log(carouselData.value.length);
let flag = false;
const prevClickSlide = () => {
  if (flag) return;
  flag = true;
  currentIdx.value--;
  offsetVal.value += SLIDE_WIDTH.value;
  noTransition.value = false;

  // 当到达前面添加的项时需要跳转
  if (currentIdx.value === 2) {
    setTimeout(() => {
      noTransition.value = true;
      // 跳转到原数组的最后一项（位置在 原数组长度+3-1）
      currentIdx.value = originalLength.value + 2;
      // 计算对应的偏移量
      offsetVal.value = -(SLIDE_WIDTH.value * (originalLength.value - 1));
      // console.log('prev click', currentIdx.value, offsetVal.value, SLIDE_WIDTH.value, originalLength.value - 1);
    }, 500);
  }
  emits(
    'handleChangeItem',
    localCarouselData.value[currentIdx.value].id || localCarouselData.value[currentIdx.value].axis_id,
  );
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('prev Click', currentIdx.value);
};

const nextClickSlide = () => {
  if (flag) return;
  flag = true;
  currentIdx.value++;
  offsetVal.value -= SLIDE_WIDTH.value;
  noTransition.value = false;

  // 当到达后面添加的项时需要跳转
  if (currentIdx.value === originalLength.value + 3) {
    setTimeout(() => {
      noTransition.value = true;
      // 跳转回到原数组的第一项（位置在索引3）
      currentIdx.value = 3;
      // 重置偏移量
      // offsetVal.value = -(SLIDE_WIDTH * 3);
      offsetVal.value = 0;
    }, 500);
  }
  // console.log('handleChangeItem', localCarouselData.value, currentIdx.value, localCarouselData.value[currentIdx.value]);
  emits(
    'handleChangeItem',
    localCarouselData.value[currentIdx.value].id || localCarouselData.value[currentIdx.value].axis_id,
  );
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('next click', currentIdx.value, localCarouselData.value[currentIdx.value]);
};

const prevClickAlone = () => {
  console.log('prevClickAlone log: ', currentIdx.value);
  if (!currentIdx.value) {
    alert('当前是第一个');
    return;
  }
  if (flag) return;
  flag = true;
  currentIdx.value--;
  offsetVal.value += SLIDE_WIDTH.value + 30;
  noTransition.value = false;

  // 当到达前面添加的项时需要跳转
  // if (currentIdx.value === 2) {
  //   setTimeout(() => {
  //     noTransition.value = true;
  //     // 跳转到原数组的最后一项（位置在 原数组长度+3-1）
  //     currentIdx.value = originalLength.value + 2;
  //     // 计算对应的偏移量
  //     offsetVal.value = -(SLIDE_WIDTH.value * (originalLength.value - 1));
  //     // console.log('prev click', currentIdx.value, offsetVal.value, SLIDE_WIDTH.value, originalLength.value - 1);
  //   }, 500);
  // }
  console.log('handleChangeItem', carouselData, currentIdx.value, carouselData[currentIdx.value]);
  emits('handleChangeItem', carouselData[currentIdx.value].id || carouselData[currentIdx.value].axis_id);
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('prev Click', currentIdx.value);
};

const nextClickAlone = () => {
  console.log('nextClickAlone log: ', currentIdx.value);
  if (currentIdx.value) {
    alert('当前是最后一个');
    return;
  }
  if (flag) return;
  flag = true;
  currentIdx.value++;
  offsetVal.value -= SLIDE_WIDTH.value + 30;
  noTransition.value = false;

  // 当到达后面添加的项时需要跳转
  // if (currentIdx.value === originalLength.value + 3) {
  //   setTimeout(() => {
  //     noTransition.value = true;
  //     // 跳转回到原数组的第一项（位置在索引3）
  //     currentIdx.value = 3;
  //     // 重置偏移量
  //     // offsetVal.value = -(SLIDE_WIDTH * 3);
  //     offsetVal.value = 0;
  //   }, 500);
  // }
  console.log('handleChangeItem', carouselData, currentIdx.value, carouselData[currentIdx.value]);
  emits('handleChangeItem', carouselData[currentIdx.value].id || carouselData[currentIdx.value].axis_id);
  setTimeout(() => {
    flag = false;
  }, 300);
  // console.log('next click', currentIdx.value, localCarouselData.value[currentIdx.value]);
};

// 初始化
onMounted(() => {
  // 设置初始位置
  if (carouselData.length < 5 && carouselData.length > 2) {
    currentIdx.value = 3;
    offsetVal.value = 0;
  } else if (carouselData.length < 3) {
    console.log('less than 3');
    SLIDE_WIDTH.value = 150;
    currentIdx.value = 0;
    offsetVal.value = SLIDE_WIDTH.value * 2;
  } else {
    currentIdx.value = 6;
    offsetVal.value = -(SLIDE_WIDTH.value * 3);
  }
  if (carouselData.length === 1) {
    emits('handleChangeItem', carouselData[0].id || carouselData[0].axis_id);
  } else {
    // console.log('onMounted log: ', localCarouselData.value[currentIdx.value]);
    emits(
      'handleChangeItem',
      localCarouselData.value[currentIdx.value].id || localCarouselData.value[currentIdx.value].axis_id,
    );
  }
});

// watch(
//   () => selectedId,
//   (newVal) => {
//     // console.log('new selcet axis id', newVal);
//   },
// );

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

const saveConfig = () => {
  emits('handleSave', localCarouselData.value[currentIdx.value].id);
};
</script>

<style scoped lang="less">
.switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;

  p {
    margin: 0;
    margin-right: 10px;
    font-size: 14px;
    color: #fff;
    font-family: 'CN Heavy';
  }
}
.carousel-box {
  width: 750px;
  height: 200px;
  display: flex;
  justify-content: center;
  // align-items: center;
  // margin-left: 160px;
  position: relative;

  .left-arrow,
  .right-arrow {
    width: 13px;
    height: 22px;
    margin-top: 90px;
    cursor: pointer;
    background-image: url('@/assets/images/arrow.svg');
    background-size: cover;
    background-repeat: no-repeat;
  }
  .left-arrow {
    transform: rotate(180deg);
  }
  .left-arrow:hover,
  .right-arrow:hover {
    background-image: url('@/assets/images/arrow_clicked.svg');
  }

  .shadow {
    width: 525px;
    display: flex;
    justify-content: center;
    overflow: hidden;
    cursor: grab; // 默认显示抓取手型
    // box-sizing: border-box;
    // padding-left: 75px;

    .carousel {
      width: 1180px;
      display: flex;
      align-items: center;
      margin-right: 80px;
      box-sizing: border-box;
      padding-left: 80px;
      // transform: translateX(-175px);
      transition: transform 0.5s ease;

      .slide {
        width: 80px;
        height: 80px;
        overflow: hidden;
        margin-left: 80px;
        flex-shrink: 0;
        // transition: transform 0.5s ease;
        background-image: url('@/assets/images/check_item.svg');
        background-size: cover;
        background-repeat: no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
        // transition: all 0.3s;

        img {
          width: 40px;
          height: 40px;
          object-fit: fill;
        }
      }

      .slide:first-child {
        margin-left: 0;
      }

      .selected {
        width: 125px;
        height: 125px;
        background-image: url('@/assets/images/checked_item.svg');
      }
    }

    .no-transition {
      transition: none;
    }
  }

  .single-axis {
    width: 125px;
    height: 125px;
    overflow: hidden;
    // margin-left: var(--spacing-15);
    margin-top: 30px;
    flex-shrink: 0;
    // transition: transform 0.5s ease;
    background-image: url('@/assets/images/check_item.svg');
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    // transition: all 0.3s;

    img {
      width: 40px;
      height: 40px;
      object-fit: fill;
    }
  }

  .bottom-taskbar {
    position: absolute;
    top: 210px;
    left: calc(var(300px) - var(5px));
    &__text {
      width: 130px;
      margin-left: 35px;
      margin-top: 10px;
      display: flex;
      justify-content: center;
      span {
        display: inline-block;
        height: 20px;
        line-height: 20px;
        text-align: center;
        padding: 0 15px;
        border-radius: 10px;
        color: #000;
        font-size: 12px;
        font-family: 'CN Heavy';
      }
    }
  }
}
</style>
