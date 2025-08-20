<template>
  <div v-if="options.length > 1" class="panes-config">
    <div class="panes-config__title">{{ t('messages.configSwitch') }}</div>
    <t-popup
      destroy-on-close
      trigger="click"
      :disabled="disableConfig"
      placement="right"
      :overlay-inner-style="{
        backgroundColor: 'rgba(20, 22, 30, 0.98)',
        borderRadius: '10px',
        boxShadow: '0 4px 32px 0 rgba(0,0,0,0.28)',
        padding: '0',
      }"
    >
      <div class="panes-config__current" :class="{ 'panes-config__current--disabled': disableConfig }">
        <div class="panes-config__current-content">
          <t-icon name="keyboard" class="panes-config__current-icon" />
          <span>{{ configNames[options.indexOf(currentConfig)] }}</span>
        </div>
        <t-icon name="chevron-right" class="panes-config__current-arrow" />
      </div>

      <template #content>
        <div class="panes-config__popup">
          <div class="panes-config__popup-content">
            <div class="panes-config__popup-list">
              <div
                v-for="(option, index) in options"
                :key="String(option)"
                class="panes-config__popup-item"
                :class="{ 'panes-config__popup-item-active': currentConfig === String(option) }"
                @click="handleConfigChange(String(option))"
              >
                <div class="panes-config__popup-item-content">
                  <div class="panes-config__popup-item-left">
                    <t-icon name="keyboard" class="panes-config__popup-item-icon" />
                    <span>{{ configNames[index] }}</span>
                  </div>
                  <t-icon
                    :name="currentConfig === String(option) ? 'check-circle-filled' : 'circle'"
                    class="panes-config__popup-item-check"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </t-popup>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { useInitPageHook } from '../hooks/useInitPageHook';
import { useGlobalStore, useConfigStore } from '@/store';
import { t } from '@/locales';

const globalStore = useGlobalStore();
const configStore = useConfigStore();
const { currentConfig, configNames } = storeToRefs(globalStore);
const { disableConfig } = storeToRefs(configStore);
const options = computed(() => {
  return globalStore.configList.map((item) => String(item));
});

const handleConfigChange = async (value: string): Promise<void> => {
  globalStore.updateCurrentConfig(value);
  globalStore.setConfig();

  await useInitPageHook();
  const index = Number(value.replace('Config', '')) - 1;
  const tip = t('messages.configSwitchSuccess') + configNames.value[index];
  MessagePlugin.success(tip);
};
</script>

<style lang="less" scoped>
@import './config.less';
</style>
