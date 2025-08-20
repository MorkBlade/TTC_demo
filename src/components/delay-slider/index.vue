<template>
  <div v-if="isShow" class="delay-slider-container">
    <div class="delay-slider-container__content">
      <div class="delay-slider-container__title">{{ title }}</div>
      <div class="slider-box">
        <t-slider v-model="sliderVal" :min="min" :max="max" :step="step" :show-tooltip="true" />
      </div>
      <div class="btn-box">
        <div class="btn cancel-btn" @click="onCancel">{{ t('messages.delaySliderCancel') }}</div>
        <div class="btn sure-btn" @click="onSure">{{ t('messages.delaySliderConfirm') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/locales';

const isShow = defineModel('isShow', {
  type: Boolean,
  default: false,
});

const { delay, step, min, max } = defineProps({
  delay: { type: Number, default: 0 },
  step: { type: Number, default: 1 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1000 },
  title: { type: String, default: () => t('messages.delaySliderTitle') },
});

const emit = defineEmits(['changeDelay']);

const sliderVal = ref(delay);

const onSure = () => {
  emit('changeDelay', sliderVal.value);
  isShow.value = false;
};

const onCancel = () => {
  isShow.value = false;
};
</script>

<style scoped lang="less">
.delay-slider-container {
  position: fixed;
  inset: 0;
  z-index: 103;
  background-color: rgb(0 0 0 / 80%);

  &__title {
    font-weight: 700;
    font-size: 14px;
    text-align: center;
  }

  &__content {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    box-sizing: border-box;
    width: 400px;
    height: 200px;
    margin-top: -100px;
    margin-left: -200px;
    padding: 20px;
    background-color: rgb(233 232 232);
    border-radius: 10px;

    & .btn {
      width: 80px;
      height: 26px;
      margin-top: 30px;
      color: rgb(252 252 252 / 100%);
      font-weight: 700;
      font-size: 14px;
      line-height: 26px;
      letter-spacing: 0;
      text-align: center;
      background: rgb(41 42 46 / 100%);
      border-radius: 18px;
      cursor: pointer;

      &:hover {
        background: rgb(41 42 46 / 80%);
      }
    }

    & .sure-btn {
      color: #fff;
      background: #2d6aff;

      &:hover {
        background: #2d6aff;
      }
    }

    .slider-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80%;
      height: 50px;
      margin: 0 auto;
    }

    .btn-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 200px;
      height: 50px;
      margin: 0 auto;
    }
  }
}
</style>
