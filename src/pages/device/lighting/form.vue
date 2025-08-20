<template>
  <div class="lighting-setup">
    <div class="lighting-setup__radio-group">
      <template v-for="(item, index) in lightingArea">
        <div
          v-if="index === 0"
          :key="index"
          class="lighting-setup__radio-group-item"
          :class="{ 'is-checked': area === 'Keyboard' }"
          @click="handleRadioGroupChange('Keyboard', index)"
        >
          {{ t('messages.lightingMain') }}
        </div>
        <div
          v-if="index >= 1"
          :key="index"
          class="lighting-setup__radio-group-item"
          :class="{ 'is-checked': area === `Decorate${index}` }"
          @click="handleRadioGroupChange(`Decorate${index}`, index)"
        >
          {{ t('messages.lightingDecorate') }}{{ index }}
        </div>
      </template>
    </div>
    <!-- 灯光 -->
    <div class="lighting-container">
      <!-- 拼写修正 -->
      <!-- 灯光的模式选择 -->
      <div class="lighting-container__mode">
        <!-- 静态 -->
        <div class="lighting-container__mode-static">
          <p style="margin-bottom: 30px">{{ t('messages.lightingCustomColor') }}</p>
          <t-color-picker-panel
            v-model="hexColor"
            format="HEX"
            :show-primary-color-preview="false"
            :color-modes="['monochrome']"
            @update:model-value="handleCustomChange"
          />
          <div class="lighting-container__option">
            <div class="rgb-values">
              <p>{{ t('messages.lightingRGB') }}</p>
              <div class="rgb-input">
                <span :style="{ color: 'red' }">R</span>
                <input
                  v-model.number="rgb.R"
                  type="number"
                  :min="0"
                  :max="255"
                  @input="handleUpdateFromRgb"
                  @keydown="blockDot"
                />
              </div>
              <div class="rgb-input">
                <span :style="{ color: 'green' }">G</span>
                <input
                  v-model.number="rgb.G"
                  type="number"
                  :min="0"
                  :max="255"
                  @input="handleUpdateFromRgb"
                  @keydown="blockDot"
                />
              </div>
              <div class="rgb-input">
                <span :style="{ color: 'blue' }">B</span>
                <input
                  v-model.number="rgb.B"
                  type="number"
                  :min="0"
                  :max="255"
                  @input="handleUpdateFromRgb"
                  @keydown="blockDot"
                />
              </div>
            </div>
            <div class="scale-values">
              <p>{{ t('messages.lightingHEX') }}</p>
              <input
                v-model="hexColor"
                type="text"
                maxlength="7"
                pattern="[A-Fa-f0-9]*"
                @input="handleHEXUpdateColor"
              />
            </div>
            <!-- 恢复自定义灯光 -->
            <div style="margin-top: 10px">
              <t-button theme="primary" @click="handleRestoreDefaultLight">
                {{ t('messages.lightingRestoreDefault') }}
              </t-button>
            </div>
          </div>
        </div>
        <!-- 动态 -->
        <div class="lighting-container__mode-dynamic">
          <p>{{ t('messages.lightingEffectMode') }}</p>
          <div class="dynamic__render">
            <div
              v-for="(item, idx) in lightingEffectModes"
              :key="item.label"
              :class="['dynamic-item', light.mode === idx ? 'checked-dynamic-mode' : '']"
              @click="handleLightDynamicModeChange(idx)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
      <!-- 基础配置 -->
      <div class="lighting-container__setting">
        <div style="display: flex; align-items: center; margin-bottom: 30px">
          <template v-if="isDoubleLightingView">
            <div class="lighting-container__lighting-title">{{ t('messages.lightingUpSwitch') }}:</div>
            <t-switch v-model="upOpen" @change="handleDoubleLight(1)" />
            <div class="lighting-link" :class="{ linked: lightingLinkState }" @click="onLink">
              <icon-font :name="lightingLinkState ? 'link-1' : 'link-unlink'" />
            </div>
            <div class="lighting-container__lighting-title">{{ t('messages.lightingDownSwitch') }}:</div>
            <t-switch v-model="downOpen" @change="handleDoubleLight(0)" />
          </template>
          <template v-else>
            <div class="lighting-container__lighting-title">{{ t('messages.lightingSwitch') }}:</div>
            <t-switch v-model="light.open" @change="onChangeLight" />
          </template>
        </div>
        <p>{{ t('messages.lightingBrightness') }}</p>
        <div class="setting-brightness">
          <t-slider
            :value="light.luminance"
            :max="100"
            :show-tooltip="true"
            :input-number-props="false"
            @change="handleLuminanceChange"
          />
          <input
            :value="light.luminance"
            type="number"
            :min="0"
            :max="100"
            @change="(e: Event) => handleLuminanceChange(Number((e.target as HTMLInputElement).value))"
          />
        </div>
        <p>{{ t('messages.lightingSpeed') }}</p>
        <div class="setting-speed">
          <t-slider
            :value="light.speed"
            :max="100"
            :show-tooltip="true"
            :input-number-props="false"
            @change="handleSpeedChange"
          />
          <input
            :value="light.speed"
            type="number"
            :min="0"
            :max="100"
            @change="(e: Event) => handleSpeedChange(Number((e.target as HTMLInputElement).value))"
          />
        </div>
        <p style="margin-top: 30px">{{ t('messages.lightingColor') }}</p>
        <div class="color-choose">
          <template v-for="(ite, idx) in light.staticColors" :key="idx">
            <div v-if="idx === 0" :class="{ 'is-checked': idx === light.selectStaticColor }" @click="ChangeColor(idx)">
              <img src="@/assets/images/color-more.png" style="width: 100%; height: 100%" />
            </div>
            <div
              v-else
              :class="{ 'is-checked': idx === light.selectStaticColor }"
              :style="{ backgroundColor: ite }"
              @click="ChangeColor(idx)"
            >
              <t-config-provider :global-config="computedI18n">
                <t-color-picker
                  v-model="light.staticColors[idx]"
                  :recent-colors="null"
                  :color-modes="['monochrome']"
                  class="color-picker"
                  format="HEX"
                  :show-primary-color-preview="false"
                  @update:model-value="(val) => handleChangeColorPicker(val, idx)"
                />
              </t-config-provider>
            </div>
          </template>
        </div>
      </div>
      <!-- 饱和度 -->
      <template v-if="isSaturationOpen">
        <div class="lighting-container__saturation">
          <p>{{ t('messages.lightingSaturation') }}</p>
          <div class="lighting-container__saturation-item">
            <p>R：</p>
            <t-slider
              v-model="saturation.R"
              :max="100"
              :show-tooltip="true"
              :input-number-props="false"
              @change-end="handleSaturationChange"
            />
          </div>
          <div class="lighting-container__saturation-item">
            <p>G：</p>
            <t-slider
              v-model="saturation.G"
              :max="100"
              :show-tooltip="true"
              :input-number-props="false"
              @change-end="handleSaturationChange"
            />
          </div>
          <div class="lighting-container__saturation-item">
            <p>B：</p>
            <t-slider
              v-model="saturation.B"
              :max="100"
              :show-tooltip="true"
              :input-number-props="false"
              @change-end="handleSaturationChange"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'DeviceConfigLightingForm' });

import { storeToRefs } from 'pinia';
import { IconFont } from 'tdesign-icons-vue-next';
import enConfig from 'tdesign-vue-next/es/locale/en_US';
import zhConfig from 'tdesign-vue-next/es/locale/zh_CN';
import { useI18n } from 'vue-i18n';
import { EVENT } from '@/store/modules/device';
import { LIGHT_DYNAMIC_MODES } from '@/config/constant/index';
import { useGlobalStore, useLightingStore } from '@/store';
import { t } from '@/locales';

import { useCustomLightingHook } from './hooks/useCustomLightingHook';
import { useSaturationHook } from './hooks/useSaturationHook';
import { useLightingAreaHook } from './hooks/useLightingAreaHook';
import { useLightingUpdateHook } from './hooks/useLightingUpdateHook';
import { useDoubleLightingHook } from './hooks/useDoubleLightingHook';
import { useLightingBaseHook } from './hooks/useLightingBaseHook';
import { useVersionHooks } from '@/hooks/version/useVersionHooks';

import services from '@/services/index';

const { isCheckVersion: isCheckVersion1090 } = useVersionHooks('1.0.9.0');

const { locale } = useI18n();
const lightingStore = useLightingStore();
const globalStore = useGlobalStore();

const computedI18n = computed(() => {
  return locale.value === 'zh_CN' ? zhConfig : enConfig;
}) as any;
const { lightingArea, isDoubleLighting } = storeToRefs(globalStore);
const { area, light, saturation } = storeToRefs(lightingStore);

const { isSaturationOpen, handleSaturationChange, handleRestoreDefaultLight } = useSaturationHook();
const { hexColor, rgb, handleCustomChange, handleUpdateFromRgb, handleHEXUpdateColor, blockDot } =
  useCustomLightingHook();

lightingStore.enterCustom = true;

// 先初始化 update hook
const { lastUpdateTime, isUnmounted, lightingRaf, areaIndex } = useLightingUpdateHook();

// 然后初始化 area hook，因为它依赖 lightingRaf 和 areaIndex
const { handleRadioGroupChange, handleRadioGroupChangeDebounced, handleRadioGroupMonitoring } = useLightingAreaHook(
  lightingRaf,
  areaIndex,
);

// 其他 hooks 没有依赖关系，可以按任意顺序初始化
const { lightingLinkState, upOpen, downOpen, handleDoubleLight, onLink } = useDoubleLightingHook();

const {
  handleLuminanceChange,
  handleSpeedChange,
  handleLightDynamicModeChange,
  onChangeLight,
  ChangeColor,
  handleChangeColorPicker,
} = useLightingBaseHook();

const { isCheckVersion } = useVersionHooks('1.0.1.0');

const isDoubleLightingView = computed(() => {
  const isKeyboard = area.value === 'Keyboard';
  return isCheckVersion.value && isDoubleLighting.value && isKeyboard;
});

const lightingEffectModes = computed(() => {
  // 从灯效区域获取当前总数
  const { count } = lightingArea.value[areaIndex.value];
  return LIGHT_DYNAMIC_MODES.slice(0, count);
});

services.on(EVENT.LIGHTINGBASE, async (data: any) => {
  console.log('lightingBase', data);
  const { area } = data;
  if (isCheckVersion1090.value) {
    if (lightingStore.area === area) {
      lightingStore.updateLightingBaseData(data as any);
    } else {
      const lightAreaMap = {
        Keyboard: '0',
        Decorate1: '1',
        Decorate2: '2',
        Decorate3: '3',
        Decorate4: '4',
        Decorate5: '5',
      };
      areaIndex.value = lightAreaMap[area] - 0;
      handleRadioGroupMonitoring(area, areaIndex.value);
      lightingStore.updateLightingBaseData(data as any);
    }
  } else {
    console.log('lightingBase', data);
    const { area } = data;
    if (lightingStore.area === area) {
      lightingStore.updateLightingBaseData(data);
    }
  }
});
// 初始化 调用一个灯效就可以了
onMounted(() => {
  lastUpdateTime.value = 0;
  lightingRaf.start();
});

onBeforeUnmount(() => {
  lightingRaf.stop();
  isUnmounted.value = true;
  handleRadioGroupChangeDebounced.cancel();
  // 清理动态 style
  const styleElement = document.getElementById('keyboard-lighting-styles');
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
  }
});
</script>

<style scoped lang="less">
@import './form.less';
</style>
