<template>
  <t-form :data="formData" label-align="top" :label-width="60">
    <t-row :gutter="30">
      <t-col :span="6">
        <t-form-item :label="t('messages.customKeySystemSelect')" name="type">
          <t-radio-group v-model="formData.type" @change="handleSystemTypeChange">
            <t-radio value="win">WIN</t-radio>
            <t-radio value="mac">MAC</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-col>
      <t-col :span="6">
        <t-form-item :label="t('messages.customKeyFn')" name="fn">
          <t-radio-group v-model="formData.fn" @change="handleFnChange">
            <t-radio v-for="(item, index) in 4" :key="item" :value="index"> FN{{ item }}</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-col>
    </t-row>
  </t-form>
</template>

<script setup>
defineOptions({ name: 'DeviceConfigCustomKeyForm' });
import { t } from '@/locales';

const formData = defineModel();

const emit = defineEmits(['systemTypeChange', 'fnChange']);

const handleSystemTypeChange = () => {
  emit('systemTypeChange', { formData });
};
const handleFnChange = () => {
  emit('fnChange', { formData });
};
</script>
