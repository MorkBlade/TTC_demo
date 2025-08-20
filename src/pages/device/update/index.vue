<template>
  <div class="update-container">
    <div class="update-header">
      <div class="version-info">
        <t-icon name="update" size="48px" />
        <div class="version-details">
          <h2>{{ t('messages.updateTitle') }}</h2>
          <p v-if="deviceStore.info?.runModeVersion === 255" class="boot-mode">{{ t('messages.updateBootMode') }}</p>
          <p v-else>{{ t('messages.updateCurrentVersion') }}：v{{ currentVersion }}</p>
          <!-- <p>最新版本：v{{ latestVersion }}</p> -->
        </div>
        <div class="restore-factory">
          <t-button
            size="large"
            v-bind="updating || deviceStore.info?.runModeVersion === 255 ? { disabled: true } : {}"
            @click="handleDialogVisible"
            >{{ t('messages.updateRestoreFactory') }}</t-button
          >
        </div>
      </div>

      <div class="update-steps">
        <div class="step" :class="{ active: true, done: selectedFile }">
          <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-title">{{ t('messages.updateStep1') }}</div>
          </div>
          <div class="step-tips">
            <div class="tip-item">
              <t-icon name="info-circle" />
              <span>{{ t('messages.updateStep1Tip1') }}</span>
            </div>
            <div class="tip-item">
              <t-icon name="file" />
              <span>{{ t('messages.updateStep1Tip2') }}</span>
            </div>
          </div>
          <div class="step-action">
            <!-- <t-select v-model="updateWay" :options="ways" @change="handleUpdateWay"></t-select> -->
            <div class="upload-ways">
              <t-radio-group
                :default-value="deviceStore.httpReturnNoFirmware ? 0 : 1"
                v-bind="updating ? { disabled: true } : {}"
                @change="handleUpdateWay"
              >
                <t-radio :value="1" :disabled="deviceStore.httpReturnNoFirmware">{{
                  t('messages.updateOnline')
                }}</t-radio>
                <t-radio :value="0">{{ t('messages.updateLocal') }}</t-radio>
              </t-radio-group>
            </div>
            <template v-if="!updateWay">
              <t-upload
                v-model="fileList"
                :multiple="false"
                :auto-upload="false"
                :format-response="formatResponse"
                :before-upload="beforeUpload"
                theme="custom"
                :disabled="updating || updateProgress > 0"
                @change="handleFileChange"
              >
                <div
                  class="upload-trigger"
                  :class="{
                    'has-file': selectedFile,
                    disabled: updating || updateProgress > 0,
                  }"
                >
                  <div class="upload-icon">
                    <t-icon :name="selectedFile ? 'check-circle-filled' : 'upload'" />
                  </div>
                  <div class="upload-info">
                    <div class="primary-text">
                      {{ selectedFile ? selectedFile.name : t('messages.updateSelectFirmware') }}
                    </div>
                    <div class="secondary-text">
                      {{ selectedFile ? formatFileSize(selectedFile.size) : t('messages.updateSupportBin') }}
                    </div>
                  </div>
                  <div class="upload-action">
                    <t-button size="small" variant="outline">
                      {{ selectedFile ? t('messages.updateReSelect') : t('messages.updateBrowse') }}
                    </t-button>
                  </div>
                </div>
              </t-upload>
            </template>
            <template v-else>
              <div class="online-update" :class="{ 'has-file': selectedFile }" @click="handleDownload">
                <div class="upload-icon">
                  <t-icon :name="selectedFile ? 'check-circle-filled' : 'download'" />
                </div>
                <div class="upload-info">
                  <div class="primary-text">
                    {{
                      selectedFile
                        ? selectedFile.name + '_' + selectedFile.firmware.firmware_version
                        : t('messages.updateDownloadFirmware')
                    }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="step-divider"></div>

        <div
          class="step"
          :class="{
            active: selectedFile,
            done: updating || updateProgress === 100,
            disabled: !selectedFile,
          }"
        >
          <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-title">{{ t('messages.updateStep2') }}</div>
          </div>
          <div class="step-tips">
            <div class="tip-item">
              <t-icon name="time" />
              <span>{{ t('messages.updateStep2Tip1') }}</span>
            </div>
            <div class="tip-item">
              <t-icon name="error-circle" />
              <span>{{ t('messages.updateStep2Tip2') }}</span>
            </div>
          </div>
          <div class="step-action">
            <t-button
              class="update-button"
              theme="primary"
              :loading="loading"
              :disabled="!selectedFile || updating || updateProgress > 0"
              @click="startUpdate"
            >
              <div class="button-content">
                <t-icon name="download" />
                <span>{{ loading ? t('messages.updateUpdating') : t('messages.updateStart') }}</span>
              </div>
            </t-button>
          </div>
        </div>

        <div class="step-divider"></div>

        <div
          class="step"
          :class="{
            active: updating || updateProgress > 0,
            done: updateProgress === 100,
            disabled: !updating && updateProgress === 0,
          }"
        >
          <div class="step-header">
            <div class="step-number">3</div>
            <div class="step-title">{{ t('messages.updateStep3') }}</div>
          </div>
          <div class="step-tips">
            <div class="tip-item">
              <t-icon name="info-circle" />
              <span>{{ t('messages.updateStep3Tip1') }}</span>
            </div>
            <div class="tip-item">
              <t-icon name="help-circle" />
              <span>{{ t('messages.updateStep3Tip2') }}</span>
            </div>
          </div>
          <div class="step-action">
            <div class="progress-box" :class="{ active: updating || updateProgress > 0 }">
              <div class="progress-status">
                <span class="progress-text">{{
                  updating
                    ? t('messages.updateProgressUpdating')
                    : updateProgress === 100
                      ? t('messages.updateProgressDone')
                      : t('messages.updateProgressWait')
                }}</span>
                <span class="progress-value">{{ displayProgress }}%</span>
              </div>
              <t-progress
                :percentage="displayProgress"
                :status="displayProgress === 100 ? 'success' : 'active'"
                theme="plump"
                :stroke-width="8"
                :color="{ from: '#5C63FF', to: '#38B2AC' }"
                :track-color="updating ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)'"
                :label="false"
              />
              <div v-if="updating || displayProgress === 100" class="progress-info">
                {{ displayProgress === 100 ? t('messages.updateSuccessReboot') : t('messages.updateWriting') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="update-tips">
        <div class="tip-item">
          <div class="tip-icon">
            <t-icon name="info-circle" />
          </div>
          <div class="tip-content">
            <div class="tip-title">{{ t('messages.updatePrepare') }}</div>
            <div class="tip-desc">{{ t('messages.updatePrepareDesc') }}</div>
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">
            <t-icon name="time" />
          </div>
          <div class="tip-content">
            <div class="tip-title">{{ t('messages.updateTime') }}</div>
            <div class="tip-desc">{{ t('messages.updateTimeDesc') }}</div>
          </div>
        </div>
        <div class="tip-item">
          <div class="tip-icon">
            <t-icon name="help-circle" />
          </div>
          <div class="tip-content">
            <div class="tip-title">{{ t('messages.updateFail') }}</div>
            <div class="tip-desc">{{ t('messages.updateFailDesc') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增：自定义灯光休眠时间选择栏 -->
    <div class="update-container-list">
      <div v-if="isCheckVersion" class="sleep-delay-setting">
        <div class="sleep-delay-title">
          <span>{{ t('messages.updateSleepTitle') }}</span>
        </div>
        <div class="sleep-delay-select">
          <t-select
            v-model="lightingSleepTime"
            :options="sleepDelayOptions"
            :disabled="updating || deviceStore.info?.runModeVersion === 255"
            :placeholder="t('messages.updateSleepPlaceholder')"
            style="width: 200px"
            @change="handleSleepDelayChange"
          />
        </div>
      </div>
      <report-rate
        v-if="isCheckVersion7"
        :disabled="updating || deviceStore.info?.runModeVersion === 255"
      ></report-rate>
    </div>
    <!-- 新增结束 -->

    <t-dialog
      v-model:visible="visible"
      theme="warning"
      :header="t('messages.updateDialogTitle')"
      :body="t('messages.updateDialogBody')"
      :cancel-btn="null"
      :confirm-btn="t('common.confirm')"
      @confirm="handleRestoreFactory"
    />
    <div v-if="loading" class="shadow"></div>
  </div>
</template>

<script setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch, computed } from 'vue';
import { useInitPageHook } from '../hooks/useInitPageHook';
import { useUpdateApi } from '@/hooks/update/useUpdateApi';
import { useDeviceStore, useGlobalStore, useConfigStore } from '@/store';
import { LIGHT_SLEEP_DELAY } from '@/config/constant';
import { useVersionHooks } from '@/hooks/version/useVersionHooks';
import { t } from '@/locales';

import ReportRate from './report-rate/index.vue';

defineOptions({ name: 'DeviceUpdate' });

const deviceStore = useDeviceStore();
const globalStore = useGlobalStore();
const configStore = useConfigStore();
const { handleOnlineUpdate } = useUpdateApi();

// const currentVersion = ref('1.0.0');
// const latestVersion = ref('1.1.0');
const updateWay = ref(1); // 0: 选择文件 1: 下载文件
const updating = ref(false);
const updateProgress = ref(0);
const displayProgress = ref(0);
const isUpdateStatus = ref('');
const fileList = ref([]);
const selectedFile = ref(null);
const bindData = reactive([]);
const loading = ref(false);
const visible = ref(false);
const { isCheckVersion } = useVersionHooks('1.0.4.0');
const { isCheckVersion: isCheckVersion7 } = useVersionHooks('1.0.7.0');
const currentVersion = computed(() => {
  if (deviceStore.info) {
    // 把字符串中的-换成.
    return deviceStore.info?.appVersion.replace(/-/g, '.');
  }
  return '1.0.0';
});

const updateDisplayProgress = (targetProgress) => {
  if (targetProgress < displayProgress.value) {
    updateProgress.value = targetProgress;
    return;
  }

  displayProgress.value = Math.max(displayProgress.value, targetProgress);
};

const handleDownload = async () => {
  if (deviceStore.httpReturnNoFirmware && updateWay.value === 1) {
    MessagePlugin.error(t('messages.updateNoOnline'));
    return;
  }
  await handleOnlineUpdate();
  selectedFile.value = deviceStore.resBin;
  bindData.value = deviceStore.binData;
};

const handleFileChange = (files) => {
  if (files.length > 0) {
    const file = files[0].raw;
    if (file.name.toLowerCase().endsWith('.bin')) {
      const reader = new FileReader();
      selectedFile.value = file;
      fileList.value = files;
      reader.onload = (evt) => {
        const arrayBuffer = evt.target.result;
        bindData.value = new Uint8Array(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    } else {
      MessagePlugin.error(t('messages.updateSelectBin'));
      fileList.value = selectedFile.value ? [{ raw: selectedFile.value }] : [];
    }
  } else if (fileList.value.length === 0) {
    selectedFile.value = null;
  }
};

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const loadingId = ref(null);

const UPDATE_STEPS = {
  ENTER_BOOT: t('messages.updateLoadingEnterBoot'),
  CONNECT: t('messages.updateLoadingConnect'),
  UPDATING: t('messages.updateLoadingUpdating'),
  isWriting: t('messages.updateLoadingWriting'),
  beforeToBoot: t('messages.updateLoadingReadInfo'),
  RESTARTING: t('messages.updateLoadingRestarting'),
  beforeToApp: t('messages.updateLoadingBeforeToApp'),
};

// 将 showMessage 移到 startUpdate 外部
const showMessage = async (type, message) => {
  if (loadingId.value !== null) {
    MessagePlugin.close(loadingId.value);
    await delay(100);
  }
  if (type === 'loading') {
    loadingId.value = MessagePlugin.loading({ content: message, duration: 0 });
  } else {
    MessagePlugin[type](message);
  }
};
watch(
  () => isUpdateStatus.value,
  (newValue) => {
    // 只在 deviceStore.updateDevice 过程中触发
    if (updating.value && UPDATE_STEPS[isUpdateStatus.value]) {
      showMessage('loading', UPDATE_STEPS[isUpdateStatus.value]);
      console.log('更新状态变化:', newValue);
      // 这里可以添加你的处理逻辑
    } else {
      loading.value = false;
    }
  },
);
const startUpdate = async () => {
  if (!selectedFile.value) {
    MessagePlugin.warning(t('messages.updateSelectFileFirst'));
    return;
  }

  try {
    deviceStore.setUpdateStatus(true);
    configStore.setActiveMenuAndDisableOthers('update');
    updating.value = true;
    loading.value = true;
    updateProgress.value = 0;
    displayProgress.value = 0;

    const res = await deviceStore.updateDevice(bindData.value, ({ percentage, updateStatus }) => {
      isUpdateStatus.value = updateStatus;
      console.log('isUpdateStatus.value', isUpdateStatus.value);
      updateDisplayProgress(percentage);
    });

    if (!res) {
      throw new Error(t('messages.updateFail'));
    }

    if (loadingId.value !== null) {
      MessagePlugin.close(loadingId.value);
      await delay(100);
    }
    await showMessage('success', t('messages.updateSuccess'));
    await useInitPageHook();
    deviceStore.setUpdateStatus(false);
    configStore.setAllEnabledMenu();
    await delay(1000);
    currentVersion.value = deviceStore.info.appVersion;
    resetStates();
    deviceStore.hasNewVersion = false;
    configStore.isCalibrationDialog = true;
  } catch (error) {
    console.error('更新失败:', error);
    if (loadingId.value !== null) {
      MessagePlugin.close(loadingId.value);
      await delay(100);
    }
    await showMessage('error', error.message || t('messages.updateFailRetry'));
    resetStates();
  } finally {
    loading.value = false;
  }
};

const resetStates = () => {
  // 重置 loadingId
  if (loadingId.value !== null) {
    MessagePlugin.close(loadingId.value);
    loadingId.value = null;
  }

  // 直接重置每个响应式变量
  updating.value = false;
  loading.value = false;
  updateProgress.value = 0;
  displayProgress.value = 0;
  fileList.value = [];
  selectedFile.value = null;
  bindData.value = [];
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const beforeUpload = (file) => {
  if (!file.name.toLowerCase().endsWith('.bin')) {
    MessagePlugin.error(t('messages.updateSelectBin'));
    return false;
  }
  return true;
};

const formatResponse = (res) => {
  return res;
};

const handleDialogVisible = async () => {
  // deviceStore.appToBoot();
  visible.value = true;
};

const handleRestoreFactory = async () => {
  const res = await globalStore.restoreFactory();
  console.log('res', res);
  // 重新刷新数据
  // 1. 灯光数据重新获取

  // 2. 性能数据重新获取
  // 3. 自定义按键重新获取
  // 4. 高级键设置的数据重新获取
  // 5. 宏的数据也重新获取
  visible.value = false;
  delay(2000);
  // regainKeyboardData();
  // useConfigNamesHook();
  await useInitPageHook();
  configStore.isCalibrationDialog = true;
};

const handleUpdateWay = (idx) => {
  if (deviceStore.httpReturnNoFirmware && idx === 1) {
    MessagePlugin.error(t('messages.updateNoOnline'));
    return;
  }
  updateWay.value = idx;
  resetStates();
};

// 灯光休眠时间相关
const sleepDelayOptions = computed(() =>
  LIGHT_SLEEP_DELAY.map((item) => ({ label: t(`messages.${item.label}`), value: item.id })),
);
const { lightingSleepTime } = storeToRefs(globalStore);

// 首次进入页面时自动获取当前休眠时间并回显
const fetchSleepTime = async () => {
  try {
    await globalStore.getLightingSleepTime();
  } catch (e) {
    MessagePlugin.error(t('messages.updateGetSleepFail'));
  }
};

// 切换休眠时间时调用设置接口，并提示
const handleSleepDelayChange = async (val) => {
  try {
    await globalStore.setLightingSleepTime(val);
    MessagePlugin.success(t('messages.updateSetSleepSuccess'));
  } catch (e) {
    MessagePlugin.error(t('messages.updateSetSleepFail'));
  }
};

onMounted(async () => {
  await handleOnlineUpdate();
  await fetchSleepTime();
  if (deviceStore.httpReturnNoFirmware) {
    updateWay.value = 0;
    resetStates();
  } else {
    selectedFile.value = deviceStore.resBin;
    const { binData } = storeToRefs(deviceStore);
    bindData.value = binData;
  }
});
</script>

<style scoped lang="less">
@import './style.less';

.boot-mode {
  color: #ff4d4f !important;
  font-weight: bold;
}

.mt {
  margin-top: 30px;
}

:deep(.restore-factory) {
  .t-button {
    transition: all 0.3s ease;

    &:disabled {
      background: linear-gradient(45deg, #808080, #666);
      border: none;
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
