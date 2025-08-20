<template>
  <div class="config-container">
    <!-- 键盘方案分组整体放进大框 -->
    <div class="config-container__group">
      <!-- 标题 -->
      <div class="config-container__header">
        <div class="config-container__title">
          {{ t('messages.configTitle') }}
          <span class="card-title__sub">{{ t('messages.configSubtitle') }}</span>
        </div>
        <share-config></share-config>
      </div>

      <!-- 配置切换的内容 -->
      <div
        v-for="(item, idx) in configList.length"
        :key="idx"
        class="config-container__card"
        :class="{ active: idx === activeIndex }"
        @click="handleConfigClick(idx)"
      >
        <div class="config-container__card-title">
          <t-icon name="keyboard" style="font-size: 18px" />
          {{ configNames[idx] }}
        </div>
        <div class="config-container__card-actions">
          <span v-if="idx === activeIndex" class="current-tag">{{ t('messages.configCurrent') }}</span>
          <button v-if="!isNoConfigRename" class="rename-btn" @click.stop="openRename(idx)">
            {{ t('messages.configRename') }}
          </button>
        </div>
      </div>
    </div>
    <!-- 敬请期待大框 -->
    <div class="config-container__group">
      <div class="config-container__tips">
        <t-icon name="keyboard" class="config-container__icon" />
        <div class="config-container__forward">{{ t('messages.configComingSoon') }}</div>
        <div class="config-container__coming">{{ t('messages.configMoreFeature') }}</div>
      </div>
    </div>
  </div>
  <t-dialog
    v-model:visible="renameDialogVisible"
    :header="t('messages.configRenameDialog')"
    :on-confirm="handleRenameConfirm"
    :on-close="handleRenameCancel"
    :confirm-btn="t('common.confirm')"
    :cancel-btn="t('common.cancel')"
  >
    <t-input
      v-model="renameInput"
      :placeholder="t('messages.configRenamePlaceholder')"
      maxlength="10"
      clearable
      @input="onInputRename"
    />
    <div class="char-count">{{ renameInput.length }}/10</div>
  </t-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useGlobalStore, useKeyboardStore } from '@/store';
import ShareConfig from '../components/shareConfig.vue';
import { t } from '@/locales';
// TODO:增加配置导入导出功能
const renameDialogVisible = ref(false);
const renameInput = ref('');
const renameIdx = ref(-1);
const globalStore = useGlobalStore();
const { configList, currentConfig, configNames, isNoConfigRename } = storeToRefs(globalStore);
const keyboardStore = useKeyboardStore();

const activeIndex = computed(() => {
  return currentConfig.value.replace('Config', '') - 1;
});

function openRename(idx) {
  renameIdx.value = idx;
  renameInput.value = configNames.value[idx];
  renameDialogVisible.value = true;
}

function handleRenameConfirm() {
  if (renameInput.value.trim() && renameIdx.value !== -1) {
    configNames.value[renameIdx.value] = renameInput.value.trim();
    globalStore.setConfigName(renameIdx.value, renameInput.value.trim());
  }
  renameDialogVisible.value = false;
}

function handleRenameCancel() {
  renameDialogVisible.value = false;
}

function onInputRename(e) {
  const val = e.target.value;
  // 允许英文、中文和数字
  renameInput.value = val.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
}

async function handleConfigClick(idx) {
  if (idx === activeIndex.value) return;

  const configValue = `Config${idx + 1}`;
  globalStore.updateCurrentConfig(configValue);
  await globalStore.setConfig();
  await keyboardStore.getKeyLayout({ layer: 0 });
  activeIndex.value = idx;
  MessagePlugin.success(t('messages.configSwitchSuccess') + configNames.value[idx]);
}
</script>

<style scoped lang="less">
@import './style.less';

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}
</style>
