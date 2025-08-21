<template>
  <div class="device-performance-page__trigger">
    <div class="switch-box">
      <p>{{ t('messages.rapidTriggerRT') }}:</p>
      <t-switch v-model="rtSwitch" :disabled="!slideable" size="medium" @change="onChangeRT" />
    </div>
    <div v-if="!rtSwitch">
      <p>{{ t('messages.triggerTravelSetting') }}:</p>
      <div class="trigger-slider">
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
    <div v-else class="rt-slider-box">
      <div class="rt-slider">
        <p>{{ t('messages.firstTriggerTravel') }}:</p>
        <div class="trigger-slider">
          <t-slider
            v-model="rtFirstTouchTravel"
            :show-tooltip="true"
            :disabled="!slideable || !rtSwitch"
            :min="rtFirstOption.min"
            :max="rtFirstOption.max"
            :step="0.1"
            :tooltip-props="{ placement: 'bottom', content: rtFirstTouchTravel + 'mm' }"
            @change-end="updateRtFirstTouch"
          />
          <!-- <div class="trigger-slider__text">
            <t-input-number
              v-if="showRtFirstTouchTravelInput"
              :value="rtFirstTouchTravel"
              size="small"
              :decimal-places="3"
              :min="rtFirstOption.min"
              :max="rtFirstOption.max"
              :step="rtFirstOption.step"
              :disabled="!slideable || !rtSwitch"
              :format="(value) => `${value} mm`"
              @change="updateRtFirstTouch"
              @blur="updateRtFirstBlur"
            />
          </div> -->
        </div>
      </div>
      <div class="rt-slider">
        <p>{{ t('messages.pressTrigger') }}:</p>
        <div class="trigger-slider">
          <t-slider
            v-model="rtKeyDownTravel"
            :show-tooltip="true"
            :disabled="!slideable || !rtSwitch"
            :min="rtPressOption.min"
            :max="rtPressOption.max"
            :step="0.1"
            :tooltip-props="{ placement: 'bottom', content: rtKeyDownTravel + 'mm' }"
            @change-end="updateRtPressTouch"
          />
          <!-- <div class="trigger-slider__text">
            <t-input-number
              v-if="showRtKeyDownTravelInput"
              :value="rtKeyDownTravel"
              size="small"
              :decimal-places="3"
              :min="rtPressOption.min"
              :max="rtPressOption.max"
              :step="rtPressOption.step"
              :disabled="!slideable || !rtSwitch"
              :format="(value) => `${value} mm`"
              @change="updateRtPressTouch"
              @blur="updateRtPressBlur"
            />
          </div> -->
        </div>
      </div>
      <div class="rt-slider">
        <p>{{ t('messages.releaseReset') }}:</p>
        <div class="trigger-slider">
          <t-slider
            v-model="rtKeyUpTravel"
            :show-tooltip="true"
            :disabled="!slideable || !rtSwitch"
            :min="rtReleaseOption.min"
            :max="rtReleaseOption.max"
            :step="0.1"
            :tooltip-props="{ placement: 'bottom', content: rtKeyUpTravel + 'mm' }"
            @change-end="updateRtReleaseTouch"
          />
          <!-- <div class="trigger-slider__text">
            <t-input-number
              v-if="showRtKeyUpTravelInput"
              :value="rtKeyUpTravel"
              size="small"
              :decimal-places="3"
              :min="rtReleaseOption.min"
              :max="rtReleaseOption.max"
              :step="rtReleaseOption.step"
              :disabled="!slideable || !rtSwitch"
              :format="(value) => `${value} mm`"
              @change="updateRtReleaseTouch"
              @blur="updateRtReleaseBlur"
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
const { rtPrecision } = storeToRefs(globalStore);
const { keyboardLayout } = storeToRefs(keyboardStore);
const { activeKeys } = storeToRefs(keyboardStore);

const rtSwitch = ref(false);
const singleTouchTravel = ref(0);
const rtFirstTouchTravel = ref(0);
const rtKeyDownTravel = ref(0);
const rtKeyUpTravel = ref(0);

const showSingleTouchTravelInput = ref(true);
const showRtFirstTouchTravelInput = ref(true);
const showRtKeyDownTravelInput = ref(true);
const showRtKeyUpTravelInput = ref(true);

const getStep = (value) => {
  if (!value) return 0.1;
  if (value <= 0.001) return 0.001;
  if (value <= 0.01) return 0.001;
  if (value <= 0.1) return 0.01;
  const str = value.toString();
  if (!str.includes('.')) {
    if (value >= 1) return 0.1;
    return 0.1;
  }
  const decimalPlaces = str.split('.')[1].length;
  return 10 ** -decimalPlaces;
};

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

const rtFirstOption = computed(() => {
  return {
    min: rtPrecision.value ? rtPrecision.value : 0.001,
    max: rtOption.value.max,
    step: getStep(rtFirstTouchTravel.value),
  };
});

const rtPressOption = computed(() => {
  return {
    min: rtPrecision.value ? rtPrecision.value : 0.001,
    max: rtOption.value.max,
    step: getStep(rtKeyDownTravel.value),
  };
});

const rtReleaseOption = computed(() => {
  return {
    min: rtPrecision.value ? rtPrecision.value : 0.001,
    max: rtOption.value.max,
    step: getStep(rtKeyUpTravel.value),
  };
});

const slideable = computed(() => {
  return activeKeys.value.length > 0;
});

const axisList = computed(() => {
  return performanceStore.axisList;
});

const resetSlider = () => {
  singleTouchTravel.value = 0;
  rtFirstTouchTravel.value = 0;
  rtKeyDownTravel.value = 0;
  rtKeyUpTravel.value = 0;
};

const onChangeRT = async (value) => {
  const promises = [];
  for (let i = 0; i < activeKeys.value.length; i++) {
    const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));
    keyboardLayout.value[row][col].performance.mode = rtSwitch.value ? 1 : 0;
    promises.push(performanceStore.setPerformance(keyboardLayout.value[row][col].performance));
  }
  const lastKey = activeKeys.value[activeKeys.value.length - 1];
  const [row, col] = lastKey.split('-').map((item) => Number(item));
  if (value && activeKeys.value.length > 0) {
    rtFirstTouchTravel.value = keyboardLayout.value[row][col].performance.rtFirstTouch;
    rtKeyDownTravel.value = keyboardLayout.value[row][col].performance.rtPress;
    rtKeyUpTravel.value = keyboardLayout.value[row][col].performance.rtRelease;
  } else if (!value && activeKeys.value.length > 0) {
    singleTouchTravel.value = keyboardLayout.value[row][col].performance.normalPress;
  }
  await Promise.all(promises);
};

const updateNormalTouch = async (value, event) => {
  if (value > rtOption.value.max) {
    singleTouchTravel.value = rtOption.value.max;
    showSingleTouchTravelInput.value = false;
    await nextTick();
    showSingleTouchTravelInput.value = true;
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

const updateNormalBlur = async (value) => {
  singleTouchTravel.value = value;
  if (!value || value < 0.001) {
    singleTouchTravel.value = 0.001;
    showSingleTouchTravelInput.value = false;
    await nextTick();
    showSingleTouchTravelInput.value = true;
  }
  if (value > rtOption.value.max) {
    singleTouchTravel.value = rtOption.value.max;
    showSingleTouchTravelInput.value = false;
    await nextTick();
    showSingleTouchTravelInput.value = true;
  }
  await updateNormalTravel();
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

const updateRtFirstTouch = async (value, event) => {
  if (value > rtOption.value.max) {
    rtFirstTouchTravel.value = rtOption.value.max;
    showRtFirstTouchTravelInput.value = false;
    await nextTick();
    showRtFirstTouchTravelInput.value = true;
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
  if (value < rtOption.value.min) value = rtOption.value.min;

  rtFirstTouchTravel.value = value;
  await updateRtFirstTravel();
};

const updateRtFirstBlur = async (value) => {
  rtFirstTouchTravel.value = value;
  if (!value || value < rtOption.value.min) {
    rtFirstTouchTravel.value = rtOption.value.min;
    showRtFirstTouchTravelInput.value = false;
    await nextTick();
    showRtFirstTouchTravelInput.value = true;
  }
  if (value > rtOption.value.max) {
    rtFirstTouchTravel.value = rtOption.value.max;
    showRtFirstTouchTravelInput.value = false;
    await nextTick();
    showRtFirstTouchTravelInput.value = true;
  }

  await updateRtFirstTravel();
};

const updateRtFirstTravel = async () => {
  const promises = [];
  for (let i = 0; i < activeKeys.value.length; i++) {
    const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));
    keyboardLayout.value[row][col].performance.mode = 1;
    keyboardLayout.value[row][col].performance.rtFirstTouch = rtFirstTouchTravel.value;
    promises.push(performanceStore.setPerformance(keyboardLayout.value[row][col].performance));
  }
  await Promise.all(promises);
};

const updateRtPressTouch = async (value, event) => {
  if (value > rtPressOption.value.max) {
    rtKeyDownTravel.value = rtPressOption.value.max;
    showRtKeyDownTravelInput.value = false;
    await nextTick();
    showRtKeyDownTravelInput.value = true;
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
  if (value < rtOption.value.min) value = rtOption.value.min;
  rtKeyDownTravel.value = value;
  await updateRtPressTravel();
};

const updateRtPressBlur = async (value) => {
  rtKeyDownTravel.value = value;
  if (!value || value < rtOption.value.min) {
    rtKeyDownTravel.value = rtOption.value.min;
    showRtKeyDownTravelInput.value = false;
    await nextTick();
    showRtKeyDownTravelInput.value = true;
  }
  if (value > rtOption.value.max) {
    rtKeyDownTravel.value = rtOption.value.max;
    showRtKeyDownTravelInput.value = false;
    await nextTick();
    showRtKeyDownTravelInput.value = true;
  }

  await updateRtPressTravel();
};

const updateRtPressTravel = async () => {
  const promises = [];
  for (let i = 0; i < activeKeys.value.length; i++) {
    const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));
    keyboardLayout.value[row][col].performance.mode = 1;
    keyboardLayout.value[row][col].performance.rtPress = rtKeyDownTravel.value;
    promises.push(performanceStore.setPerformance(keyboardLayout.value[row][col].performance));
  }
  await Promise.all(promises);
};

const updateRtReleaseTouch = async (value, event) => {
  if (value > rtReleaseOption.value.max) {
    rtKeyUpTravel.value = rtReleaseOption.value.max;
    showRtKeyUpTravelInput.value = false;
    await nextTick();
    showRtKeyUpTravelInput.value = true;
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
  if (value < rtOption.value.min) value = rtOption.value.min;
  rtKeyUpTravel.value = value;
  await updateRtReleaseTravel();
};

const updateRtReleaseBlur = async (value) => {
  rtKeyUpTravel.value = value;
  if (!value || value < rtOption.value.min) {
    rtKeyUpTravel.value = rtOption.value.min;
    showRtKeyUpTravelInput.value = false;
    await nextTick();
    showRtKeyUpTravelInput.value = true;
  }
  if (value > rtOption.value.max) {
    rtKeyUpTravel.value = rtOption.value.max;
    showRtKeyUpTravelInput.value = false;
    await nextTick();
    showRtKeyUpTravelInput.value = true;
  }

  await updateRtReleaseTravel();
};

const updateRtReleaseTravel = async () => {
  const promises = [];
  for (let i = 0; i < activeKeys.value.length; i++) {
    const [row, col] = activeKeys.value[i].split('-').map((item) => Number(item));
    keyboardLayout.value[row][col].performance.mode = 1;
    keyboardLayout.value[row][col].performance.rtRelease = rtKeyUpTravel.value;
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
    console.log('newKey', newKey);
    const [row, col] = newKey.split('-').map((item) => Number(item));
    rtSwitch.value = keyboardLayout.value[row][col].performance.mode === 1;
    if (rtSwitch.value) {
      rtFirstTouchTravel.value = keyboardLayout.value[row][col].performance.rtFirstTouch;
      rtKeyDownTravel.value = keyboardLayout.value[row][col].performance.rtPress;
      rtKeyUpTravel.value = keyboardLayout.value[row][col].performance.rtRelease;
    } else {
      singleTouchTravel.value = keyboardLayout.value[row][col].performance.normalPress;
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
@import './style/PerformanceTrigger.less';
</style>
