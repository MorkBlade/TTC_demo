<template>
  <div class="device-performance-page__dead-zone">
    <div class="dz-switch">
      <p>死区设置:</p>
      <t-switch v-model="deadSwitch" :disabled="!slideable" size="medium" @change="onChangeDead" />
    </div>
    <div class="dz-slider-warp" v-if="deadSwitch">
      <div class="dz-slider-box">
        <p>{{ t('messages.initialDeadZone') }}:</p>
        <img src="" alt="" />
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
        <img src="" alt="" />
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
import { useKeyboardStore, usePerformanceStore } from '@/store';
import { t } from '@/locales';

const keyboardStore = useKeyboardStore();
const performanceStore = usePerformanceStore();
const { keyboardLayout } = storeToRefs(keyboardStore);
const { activeKeys } = storeToRefs(keyboardStore);

const deadZoneDown = ref(0);
const deadZoneUp = ref(0);
const deadSwitch = ref(false);

const showDeadZoneUpInput = ref(true);
const showDeadZoneDownInput = ref(true);

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
  },
  { immediate: true },
);
</script>

<style lang="less">
@import './style/PerformanceDeadZone.less';
.slider_rail {
  .t-slider {
    .t-slider__rail {
      background-image: url('@/assets/images/dead_progress_bg.svg') !important;
    }
  }
}
</style>
