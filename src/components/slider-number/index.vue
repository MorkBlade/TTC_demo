<template>
  <div class="slider-number">
    <t-slider v-model="value" :max="config.max" :min="config.min" :step="config.step" />
    <t-input-number
      v-model="value"
      :max="config.max"
      :min="config.min"
      :step="config.step"
      :decimal-places="config.decimalPlaces"
    >
      <template #suffix
        ><span>{{ config.suffix }}</span></template
      >
    </t-input-number>
  </div>
</template>

<script setup>
defineOptions({ name: 'SliderNumber' });

const value = defineModel();
const config = defineProps({
  max: { type: Number, default: 15 },
  min: { type: Number, default: 0 },
  step: { type: Number, default: 1.2 },
  decimalPlaces: { type: Number, default: 2 },
  suffix: { type: String, default: 'mm' },
});
</script>

<style scoped lang="less">
.slider-number {
  display: flex;
  align-items: center;
  width: 100%;
  margin-left: 16px;

  :deep(.t-input-number) {
    flex: 1 0 auto;
    width: 180px;
    margin-left: 30px;
  }
}
</style>
