<template>
  <div class="report-rate">
    <div class="report-rate-title">
      <span>{{ t('messages.updateReportRate') }}：</span>
    </div>
    <div class="report-rate-select">
      <t-select
        v-model="reportRate"
        :options="options"
        :disabled="props.disabled"
        :placeholder="t('messages.updateReportRatePlaceholder')"
        style="width: 200px"
        @change="handleReportRateChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ReportRate' });
import { t } from '@/locales';

import { useGlobalStore } from '@/store';

const globalStore = useGlobalStore();
const reportRate = ref(0); // Default to the first option (8KHz)
const options = reactive([]);

const props = defineProps({
  disabled: { type: Boolean, default: false },
});

const handleReportRateChange = async (value) => {
  reportRate.value = value;
  await globalStore.setRateOfReturn(options[value].key);
};

onMounted(async () => {
  const rateOfReturnList = await globalStore.getRateOfReturnList();
  options.push(...rateOfReturnList);
  const rateOfReturn = await globalStore.getRateOfReturn(); // Initialize with the stored report rate
  reportRate.value = rateOfReturn;
});
</script>

<style scoped lang="less">
.report-rate {
  display: flex;
  align-items: center;
  gap: 32px;
}

.report-rate-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 90%);
  font-weight: 500;
  font-size: 16px;

  .t-icon {
    color: #4a8eff;
    font-size: 28px;
    background: rgb(74 142 255 / 10%);
    border-radius: 8px;
    padding: 6px;
  }
}

.report-rate-select {
  flex: 1;
  min-width: 200px;

  :deep(.t-select) {
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;
    color: #222;
    font-size: 14px;

    .t-input__inner {
      color: #222;
    }

    .t-fake-arrow {
      color: #222;
    }
  }
}
</style>
