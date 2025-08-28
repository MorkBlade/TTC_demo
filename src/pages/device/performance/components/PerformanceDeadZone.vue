<template>
  <div class="device-performance-page__dead-zone">
    <div style="margin-bottom: 65px">
      <p>{{ t('messages.triggerTravelSetting') }}:</p>
      <span style="font-size: 0.75rem; color: #808080">触发的键程越短，响应越快，但会增加误触的风险。</span>
      <br />
      <span style="font-size: 0.75rem; margin-top: 20px; display: block">当前已选：</span>
      <span style="color: #00c3ff; font-size: 0.75rem; display: block; margin-bottom: 15px"
        >{{ activeKeys.length }}个按键</span
      >
      <div class="trigger-slider trigger_slider_rail">
        <t-slider
          v-model="singleTouchTravel"
          :show-tooltip="true"
          :disabled="!slideable"
          :min="rtOption.min"
          :max="rtOption.max"
          :step="0.1"
          :tooltip-props="{ placement: 'bottom', content: singleTouchTravel + 'mm' }"
          @keydown.prevent
          @change-end="updateNormalTouch"
        />
        <!-- <div class="trigger-slider__text">
          <t-input-number
            v-if="showSingleTouchTravelInput"
            :value="singleTouchTravel"
            size="small"
            :decimal-places="3"
            :min="rtOption.min"
            :max="rtOption.max"
            :step="rtOption.step"
            :disabled="!slideable"
            :format="(value) => `${value} mm`"
            @change="updateNormalTouch"
            @blur="updateNormalBlur"
          />
        </div> -->
      </div>
    </div>
    <div class="dz-switch">
      <div class="set-switch">
        <p>死区设置:</p>
        <t-switch v-model="deadSwitch" :disabled="!slideable" size="medium" @change="onChangeDead" />
      </div>
      <span>自动限制触发键程，以避免误触、断触或不触发的情况。</span>
    </div>
    <div class="dz-slider-warp" v-if="deadSwitch">
      <div class="dz-slider-box">
        <p>{{ t('messages.initialDeadZone') }}:</p>
        <!-- <img src="" alt="" /> -->
        <div class="trigger-slider">
          <t-slider
            class="slider_rail"
            v-model="deadZoneDown"
            :show-tooltip="true"
            :disabled="!slideable"
            :min="deadZoneOption.min"
            :max="deadZoneOption.max"
            :step="deadZoneOption.step"
            :tooltip-props="{ placement: 'bottom', content: deadZoneDown.toFixed(2) + 'mm' }"
            @change-end="updatePressDeadZone"
          />
          <!-- <div class="trigger-slider__text">
            <t-input-number
              v-if="showDeadZoneDownInput"
              :value="deadZoneDown"
              size="small"
              :decimal-places="3"
              :min="deadZoneOption.min"
              :max="deadZoneOption.max"
              :step="deadZoneOption.step"
              :disabled="!slideable"
              :format="(value) => `${value} mm`"
              @change="updatePressDeadZone"
              @blur="updatePressDzBlur"
            />
          </div> -->
        </div>
      </div>
      <div class="dz-slider-box">
        <p>{{ t('messages.bottomDeadZone') }}:</p>
        <!-- <img src="" alt="" /> -->
        <div class="trigger-slider">
          <t-slider
            class="slider_rail"
            v-model="deadZoneUp"
            :show-tooltip="true"
            :disabled="!slideable"
            :min="deadZoneUpOption.min"
            :max="deadZoneUpOption.max"
            :step="deadZoneUpOption.step"
            :tooltip-props="{ placement: 'bottom', content: deadZoneUp.toFixed(2) + 'mm' }"
            @change-end="updateReleaseDeadZone"
          />
          <!-- <div class="trigger-slider__text">
            <t-input-number
              v-if="showDeadZoneUpInput"
              :value="deadZoneUp"
              size="small"
              :decimal-places="3"
              :min="deadZoneUpOption.min"
              :max="deadZoneUpOption.max"
              :step="deadZoneUpOption.step"
              :disabled="!slideable"
              :format="(value) => `${value} mm`"
              @change="updateReleaseDeadZone"
              @blur="updateReleaseDzBlur"
            />
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useKeyboardStore, usePerformanceStore, useGlobalStore } from '@/store';
import { t } from '@/locales';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const globalStore = useGlobalStore();
const { keyboardLayout } = storeToRefs(keyboardStore);
const { activeKeys } = storeToRefs(keyboardStore);
const { rtPrecision } = storeToRefs(globalStore);

const singleTouchTravel = ref(0);
const deadZoneDown = ref(0);
const deadZoneUp = ref(0);
const deadSwitch = ref(false);

const showDeadZoneUpInput = ref(true);
const showDeadZoneDownInput = ref(true);

const axisList = computed(() => {
  return performanceStore.axisList;
});

const rtOption = computed(() => {
  let max = 0;
  activeKeys.value.forEach((item) => {
    const [row, col] = item.split('-').map((item) => Number(item));
    if (
      keyboardLayout.value[row][col].performance.axis !== null &&
      keyboardLayout.value[row][col].performance.axis !== undefined
    ) {
      const index = keyboardLayout.value[row][col].performance.axis;
      let driveRange = axisList.value[index]?.drive_range;
      if (driveRange === undefined) {
        driveRange = 3.4;
      }
      if (Number(driveRange) > max) {
        max = Number(driveRange);
      }
    }
  });
  return {
    min: rtPrecision.value ? rtPrecision.value : 0.001,
    max: max === 0 ? 3.3 : max,
    step: getStep(singleTouchTravel.value),
  };
});

const getStep = (value) => {
  if (!value) return 0.1;
  if (value <= 0.001) return 0.001;
  if (value <= 0.01) return 0.001;
  if (value === 0.1) return 0.1;
  if (value <= 0.1) return 0.01;
  const str = value.toString();
  if (!str.includes('.')) {
    if (value >= 1) return 0.1;
    return 0.1;
  }
  const decimalPlaces = str.split('.')[1].length;
  return 10 ** -decimalPlaces;
};

const deadZoneOption = computed(() => {
  return {
    min: 0,
    max: 1,
    step: getStep(deadZoneDown.value),
  };
});

const deadZoneUpOption = computed(() => {
  return {
    min: 0,
    max: 1,
    step: getStep(deadZoneUp.value),
  };
});

const slideable = computed(() => {
  return activeKeys.value.length > 0;
});

const resetSlider = () => {
  singleTouchTravel.value = 0;
  deadZoneDown.value = 0;
  deadZoneUp.value = 0;
};

const updatePressDeadZone = async (value) => {
  if (value > deadZoneOption.value.max) return;
  deadZoneDown.value = value;
  await updatePressDz();
};

const onChangeDead = async (value) => {
  deadSwitch.value = value;
  console.log(value);
};

const updateNormalTouch = async (value, event) => {
  if (value > rtOption.value.max) {
    singleTouchTravel.value = rtOption.value.max;
    await nextTick();
  }
  if (value === 0) {
    return;
  }
  if (event?.type === 'add') {
    if (value === 0.011) {
      value = 0.02;
    } else if (value === 0.11) {
      value = 0.2;
    }
  }
  if (value > rtOption.value.max) return;

  if (value < 0.001) value = 0.001;
  singleTouchTravel.value = value;
  await updateNormalTravel();
};

const updatePressDzBlur = async (value) => {
  if (value === undefined || value < 0) deadZoneDown.value = 0;
  if (value > deadZoneOption.value.max) {
    deadZoneDown.value = deadZoneOption.value.max;
    showDeadZoneDownInput.value = false;
    await nextTick();
    showDeadZoneDownInput.value = true;
  }
  // deadZoneDown.value = value;
  await updatePressDz();
};

const updatePressDz = async () => {
  const promises = [];
  for (let i = 0; i < activeKeys.value.length; i++) {
    const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));
    keyboardLayout.value[row][col].performance.pressDeadStroke = deadZoneDown.value;
    promises.push(performanceStore.setPerformance(keyboardLayout.value[row][col].performance));
  }
  await Promise.all(promises);
};

const updateReleaseDeadZone = async (value) => {
  if (value > deadZoneOption.value.max) return;
  deadZoneUp.value = value;
  await updateReleaseDz();
};

const updateReleaseDzBlur = async (value) => {
  if (value === undefined || value < 0) deadZoneUp.value = 0;
  if (value > deadZoneOption.value.max) {
    deadZoneUp.value = deadZoneOption.value.max;
    showDeadZoneUpInput.value = false;
    await nextTick();
    showDeadZoneUpInput.value = true;
  }
  // deadZoneUp.value = value;
  await updateReleaseDz();
};

const updateNormalTravel = async () => {
  const promises = [];
  for (let i = 0; i < activeKeys.value.length; i++) {
    const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));
    keyboardLayout.value[row][col].performance.mode = 0;
    keyboardLayout.value[row][col].performance.normalPress = singleTouchTravel.value;
    promises.push(performanceStore.setPerformance(keyboardLayout.value[row][col].performance));
  }
  await Promise.all(promises);
};

const updateReleaseDz = async () => {
  const promises = [];
  for (let i = 0; i < activeKeys.value.length; i++) {
    const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));
    keyboardLayout.value[row][col].performance.releaseDeadStroke = deadZoneUp.value;
    promises.push(performanceStore.setPerformance(keyboardLayout.value[row][col].performance));
  }
  await Promise.all(promises);
};

watch(
  () => activeKeys.value[activeKeys.value.length - 1],
  (newKey) => {
    if (!newKey) {
      resetSlider();
      return;
    }
    const [row, col] = newKey.split('-').map((item) => Number(item));
    deadZoneDown.value = keyboardLayout.value[row][col].performance.pressDeadStroke;
    deadZoneUp.value = keyboardLayout.value[row][col].performance.releaseDeadStroke;
    singleTouchTravel.value = keyboardLayout.value[row][col].performance.normalPress;
  },
  { immediate: true },
);
</script>

<style lang="less">
@import './style/PerformanceDeadZone.less';
.slider_rail {
  .t-slider {
    padding-left: 5px;
    background-image: url('@/assets/images/dead_progress_bg.svg') !important;
    background-repeat: no-repeat;
    background-size: cover;
    width: 160px;
    height: 30px;
    position: relative;
    .t-slider__rail {
      width: 135px;
      position: absolute;
      left: 8px;
    }
    .t-slider__track {
      background-image: url('@/assets/images/progresss_min.svg') !important;
      background-size: cover;
      height: 7px;
    }
    .t-slider__button {
      background-size: 10px;
    }
    .t-slider__button-wrapper {
      left: 5%;
    }
  }
}
</style>
