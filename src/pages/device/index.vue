<template>
  <div class="device-page">
    <div class="multi-language-float">
      <!-- <multi-language /> -->
    </div>
    <t-layout>
      <device-info></device-info>
      <t-header class="header" style="position: absolute; left: 30%">
        <header-menu></header-menu>
      </t-header>
      <!-- <t-aside style="flex-shrink: 0">
        <device-info></device-info>
        <config></config>
        <t-header class="header">
          <header-menu></header-menu>
        </t-header>
      </t-aside> -->
      <t-layout>
        <template v-if="isRender">
          <keyboard v-show="hasKeyboard" :props-visible="hasKeyboard"></keyboard>
          <device-keyboard-lighting v-if="isLightingKeyboardArea && active === 'lighting'"></device-keyboard-lighting>
          <device-keyboard-decorative-lighting v-if="isLightingOtherArea && active === 'lighting'">
          </device-keyboard-decorative-lighting>
          <t-content class="content">
            <template v-if="active === 'customKey'">
              <!-- <custom-key></custom-key> -->
              <key-allocation></key-allocation>
            </template>
            <template v-if="active === 'lighting'">
              <lighting />
            </template>
            <template v-if="active === 'performance'">
              <performance />
            </template>
            <template v-if="active === 'highLevelKey'">
              <high-level-key />
            </template>
            <template v-if="active === 'macro'">
              <macro />
            </template>
            <template v-if="active === 'calibration'">
              <!-- <calibration /> -->
            </template>
            <template v-if="active === 'update'">
              <device-config-update />
            </template>
            <template v-if="active === 'screen'">
              <screen />
            </template>
            <template v-if="active === 'config'">
              <device-config />
            </template>
          </t-content>
        </template>
      </t-layout>
    </t-layout>
    <!-- <t-dialog
      v-model:visible="visible"
      :header="t('messages.calibrationDialogTitle')"
      :body="t('messages.calibrationDialogBody')"
      :close-btn="false"
      confirm-btn="开始校准"
      :cancel-btn="t('common.cancel')"
      @confirm="gotoCalibration"
      @close="closeCalibration"
    >
    </t-dialog> -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { debounce } from 'lodash';
import { MessagePlugin } from 'tdesign-vue-next';
import { useInitPageHook } from './hooks/useInitPageHook';
import emitter from '@/utils/app-emitter';
import services from '@/services/index';
import { EVENT } from '@/store/modules/device';
import { useKeyboardStore, useGlobalStore, useLightingStore, usePerformanceStore, useDeviceStore } from '@/store';
import Lighting from './lighting/index.vue';
import Keyboard from './keyboards/keyboard/index.vue';
// import customKey from './custom-key/index.vue';
// 导入按键分配组件
import KeyAllocation from '@/pages/device/key-allocation/index.vue';
import DeviceInfo from './components/DeviceInfo.vue';
import HeaderMenu from '@/components/menu/index.vue';
import Performance from './performance/index.vue';
import macro from './macro/index.vue';
// import Calibration from './calibration/index.vue';
import highLevelKey from './high-level-key/index.vue';
import DeviceConfigUpdate from './update/index.vue';
import screen from './screen/index.vue';
import DeviceConfig from './config/index.vue';
import DeviceKeyboardDecorativeLighting from './keyboards/decorative-lighting/index.vue';
import DeviceKeyboardLighting from './keyboards/lighting/index.vue';
import { useUpdateApi } from '@/hooks/update/useUpdateApi';
import MultiLanguage from './components/multi-language.vue';
import { useCalibrationHook } from './hooks/useCalibrationHook';
import { useConfigStore } from '@/store/modules/config';
import { useVersionHooks } from '@/hooks/version/useVersionHooks';

import { t } from '@/locales';

const configStore = useConfigStore();

const configNames = ref([]);

const router = useRouter();

const lightingStore = useLightingStore();

const deviceStore = useDeviceStore();

const { handleOnlineUpdate } = useUpdateApi();

const isRender = ref<boolean>(false);
const visible = ref(false);
const hasKeyboard = ref<boolean>(false);
const active = ref<string>('performance');
const performanceStore = usePerformanceStore();
const { performanceTab } = storeToRefs(performanceStore);
const { isCalibration } = useCalibrationHook();

// 标记是否已经完成初始化
const isInitialized = ref(false);

// 监听 configStore.isCalibrationDialog 变化
watch(
  () => configStore.isCalibrationDialog,
  (newVal) => {
    // 只有在初始化完成后才响应变化
    if (isInitialized.value) {
      visible.value = newVal;
    }
  },
);

emitter.on('menu-click', ({ value: data }) => {
  lightingStore.area = 'Keyboard';
  hasKeyboard.value = ['performance', 'customKey', 'highLevelKey', 'macro'].includes(data);
  active.value = data;
});

// 拔插事件的监听
emitter.on('disconnect', (isUpdate) => {
  if (isUpdate) return;
  if (router) {
    router.replace({ path: '/' }).then(() => {
      window.location.reload();
    });
  }
});

// 在灯光区域的时候，是键盘区域还是灯光区域
const isLightingKeyboardArea = computed(() => {
  return lightingStore.area === 'Keyboard';
});

const isLightingOtherArea = computed(() => {
  return lightingStore.area !== 'Keyboard';
});

const globalStore = useGlobalStore();
const { isDoubleLighting } = storeToRefs(globalStore);
const keyboardStore = useKeyboardStore();
let firstTime = true;

const isApiDebounceRunning = ref(false);
const loading = ref(false);

const apiDebounce = async () => {
  if (isApiDebounceRunning.value) return;
  isApiDebounceRunning.value = true;
  // loading.value = true;
  try {
    // 先获取键盘数据，因为其他操作可能依赖它
    await regainKeyboardData();
    // 然后并行获取其他数据
    await globalStore.getLightingArea();
    await globalStore.getDoubleLighting();
  } catch (error) {
    console.error('API调用失败:', error);
  } finally {
    isApiDebounceRunning.value = false;
    loading.value = false;
  }
};
// TODO:会调用多次数据
const debouncedHandler = debounce(async (data) => {
  if (firstTime) {
    firstTime = false;
    return;
  }
  if (data.key !== globalStore.currentConfig) {
    MessagePlugin.success(t('messages.configSwitchSuccess') + configNames.value[data.value]);
  }
  globalStore.currentConfig = data.key;
  await apiDebounce();
}, 500);

// EVENT.SWITCHCONFIG => switchConfig
services.on(EVENT.SWITCHCONFIG, debouncedHandler);

services.on(
  EVENT.CUSTOMCOMMAND,
  debounce(async (data) => {
    console.log('EVENT.CUSTOMCOMMAND');
    const { boardId } = deviceStore.info;
    if (boardId === 3670017) {
      const { mode } = data;
      const modeMessages = {
        0: '切换为：办公模式',
        1: '切换为：CSGO玩家模式',
        2: '切换为：无畏契约AD玩家模式',
        3: '切换为：无畏契约松手玩家模式',
        4: '切换为：用户自定义模式',
      };
      if (mode in modeMessages) {
        MessagePlugin.success(modeMessages[mode]);
        await apiDebounce();
      }
    }
  }, 500),
);

const regainKeyboardData = async () => {
  await globalStore.getSystem();
  keyboardStore.activeKeys = [];
  keyboardStore.checkFnLayer(0);
  await keyboardStore.getKeyLayoutStyle();
  const keyboards = await keyboardStore.getKeyLayout({ layer: keyboardStore.fnLayer });
  await performanceStore.getPerformance(keyboards.flat());
  // 获取是不是双灯位的
  const lampData = isDoubleLighting.value ? 'DoubleLighting' : 'SingleLighting';
  lightingStore.lamp = lampData;
  await lightingStore.getLightingBase(lampData);
  await lightingStore.getLightingPalette();
  await lightingStore.getLightingColorCorrection();
};

const gotoCalibration = () => {
  configStore.isCalibrationDialog = false;
  performanceTab.value = 4;
  configStore.setActiveMenu('performance');
};
const closeCalibration = () => {
  configStore.isCalibrationDialog = false;
};

watch(isCalibration, (newVal) => {
  if (active.value === 'customKey' || active.value === 'macro') return;
  emitter.emit('isCalibration', newVal);
  if (newVal && !(active.value === 'performance' && performanceTab.value === 4)) {
    configStore.isCalibrationDialog = true;
  }
});

onMounted(async (): Promise<void> => {
  const { configNames: names } = await useInitPageHook();

  visible.value = configStore.isCalibrationDialog;
  configNames.value = names;
  isRender.value = true;
  // 标记初始化完成
  isInitialized.value = true;
  if (deviceStore.info?.runModeVersion === 255) {
    configStore.setActiveMenuAndDisableOthers('update');
  }
  const { isCheckVersion } = useVersionHooks('1.0.6.0');

  if (isCheckVersion.value) {
    await keyboardStore.getDefaultKeyLayout();
  }
  await handleOnlineUpdate();
});

// 在组件卸载时清理
onUnmounted(() => {
  // 清理事件监听器
  services.off(EVENT.CUSTOMCOMMAND);
  services.off(EVENT.SWITCHCONFIG);
  emitter.off('isCalibration');
  configStore.activeMenu = 'performance';
  // debouncedHandler.cancel(); // 取消未执行的防抖函数
});
</script>

<style lang="less" scoped>
@import './index.less';
</style>
