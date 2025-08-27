<template>
  <div class="lighting-setup">
    <div class="lighting-setup__radio-group">
      <!-- <template v-for="(item, index) in lightingArea">
        <div
          v-if="index === 0"
          :key="index"
          class="lighting-setup__radio-group-item"
          :class="{ 'is-checked': area === 'Keyboard' }"
          @click="handleRadioGroupChange('Keyboard', 0)"
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
      </template> -->
      <div class="lighting-setup__radio-group-item" :class="{ 'is-checked': nowTab === 0 }" @click="onChangeTab(0)">
        按键灯效
      </div>
      <!-- <div class="lighting-setup__radio-group-item" :class="{ 'is-checked': nowTab === 1 }" @click="onChangeTab(1)">
        自定义灯效
      </div>
      <div class="lighting-setup__radio-group-item" :class="{ 'is-checked': nowTab === 2 }" @click="onChangeTab(2)">
        高级设置
      </div> -->
    </div>
    <!-- 灯光 -->
    <div class="lighting-container fade-in" v-if="nowTab != 2">
      <!-- 基础配置 -->
      <div class="lighting-container__setting">
        <p style="margin-bottom: 30px">灯效设定:</p>
        <p style="font-size: 16px">休眠时间：</p>
        <div class="setting-sleep-time">
          <t-select
            v-model="sleepTimeValue"
            :popup-props="{ overlayClassName: 'select-sleep-time' }"
            @change="clickHandler"
          >
            <t-option v-for="(ite, idx) in sleepTimeOptions" :key="idx" :label="ite.lable" :value="ite.value" />
          </t-select>
        </div>
        <p style="font-size: 16px">{{ t('messages.lightingBrightness') }}：</p>
        <div class="setting-brightness">
          <t-slider
            :value="light.luminance"
            :max="100"
            :show-tooltip="true"
            :input-number-props="false"
            @change="handleLuminanceChange"
          />
        </div>
        <p style="font-size: 16px">{{ t('messages.lightingSpeed') }}：</p>
        <div class="setting-speed">
          <t-slider
            :value="light.speed"
            :max="100"
            :show-tooltip="true"
            :input-number-props="false"
            @change="handleSpeedChange"
          />
        </div>
        <!-- <p style="margin-top: 30px">{{ t('messages.lightingColor') }}</p>
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
        </div> -->
      </div>
      <div class="line"></div>
      <!-- 颜色预设 -->
      <div class="lighting-container__setting">
        <p style="margin-bottom: 30px">颜色预设:</p>
        <div class="color-choose">
          <div class="color-choose-inner">
            <template v-for="(ite, idx) in light.staticColors" :key="idx">
              <div
                v-if="idx === 0 && nowTab === 0"
                @click="ChangeColor(idx)"
                class="color-choose-item"
                :class="{ 'is-checked': idx === light.selectStaticColor }"
              >
                <div>
                  <img src="@/assets/images/color-more.png" style="width: 100%; height: 100%" />
                </div>
                <!-- <span style="font-size: 16px">彩色</span> -->
              </div>
              <div
                v-else
                class="color-choose-item"
                @click="ChangeColor(idx)"
                :class="{ 'is-checked': idx === light.selectStaticColor }"
              >
                <div :style="{ backgroundColor: ite }">
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
                <!-- <span style="font-size: 16px">{{ '灯光' + idx }}</span> -->
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="line"></div>
      <!-- 灯光的模式选择 -->
      <div class="lighting-container__mode">
        <!-- 动态 -->
        <div class="lighting-container__mode-dynamic">
          <p>灯光效果:</p>
          <div class="dynamic__render">
            <div
              v-for="(item, idx) in lightingEffectModes"
              :key="item.label"
              :class="['dynamic-item', light.mode === idx ? 'checked-dynamic-mode' : '']"
              @click="handleLightDynamicModeChange(idx)"
            >
              <img :src="getImagePath(idx)" alt="" />
              {{ item.label }}
            </div>
          </div>
        </div>
        <!-- 静态 -->
        <div class="line"></div>
        <div class="lighting-container__mode-static">
          <p style="margin-bottom: 30px">自定义颜色:</p>
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
            <!-- <div style="margin-top: 10px">
              <t-button theme="primary" @click="handleRestoreDefaultLight">
                {{ t('messages.lightingRestoreDefault') }}
              </t-button>
            </div> -->
          </div>
        </div>
      </div>
      <!-- 饱和度 -->
      <!-- <template v-if="isSaturationOpen">
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
      </template> -->
    </div>
    <div class="lighting-container" v-else>
      <div class="lighting-container__setting">
        <p style="margin-bottom: 30px">灯效设定:</p>
        <p style="font-size: 16px">色温调整：</p>
        <div class="setting-sleep-time">
          重置
          <img :src="restIcon" />
        </div>
        <p style="font-size: 16px">红色(R)：</p>
        <div class="setting-brightness">
          <t-slider
            :value="saturation.R"
            :max="50"
            :show-tooltip="true"
            :input-number-props="false"
            @change="handleSaturationChange"
          />
        </div>
        <p style="font-size: 16px">绿色(G)：</p>
        <div class="setting-speed">
          <t-slider
            :value="saturation.G"
            :max="50"
            :show-tooltip="true"
            :input-number-props="false"
            @change="handleSaturationChange"
          />
        </div>
        <p style="font-size: 16px">蓝色(B)：</p>
        <div class="setting-sleep">
          <t-slider
            :value="saturation.B"
            :max="50"
            :show-tooltip="true"
            :input-number-props="false"
            @change="handleSaturationChange"
          />
        </div>
      </div>
      <div class="line"></div>
      <div class="lighting-container__setting" v-if="isDoubleLightingView">
        <p style="margin-bottom: 30px; color: #fff; font-weight: bold">灯位控制:</p>
        <div style="display: flex; align-items: center; margin-bottom: 30px" class="lighting-container__lighting">
          <div class="lighting-container__lighting_box">
            <div class="lighting-container__lighting_warp" :class="{ check: upOpen }">
              <div class="lighting-container__lighting_text">上灯位</div>
              <img :src="upOpen ? checkTrue : checkFalse" style="width: 80%; height: 80%" />
            </div>
            <div class="lighting-container__lighting_button">
              <t-switch v-model="upOpen" @change="handleDoubleLight(1)" />
              <!-- <span @click="changeLight(1)">开启</span>
              <span @click="changeLight(1)">关闭</span> -->
            </div>
          </div>
          <div class="lighting-container__lighting_box">
            <div class="lighting-container__lighting_warp" :class="{ check: downOpen }">
              <div class="lighting-container__lighting_text">下灯位</div>
              <img :src="downOpen ? checkTrue : checkFalse" style="width: 80%; height: 80%" />
            </div>
            <div class="lighting-container__lighting_button">
              <t-switch v-model="downOpen" @change="handleDoubleLight(0)" />
              <!-- <span @click="changeLight(0)">开启</span>
              <span @click="changeLight(0)">关闭</span> -->
            </div>
          </div>
          <!-- <template v-if="isDoubleLightingView">
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
          </template> -->
        </div>
      </div>
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
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

// 预加载键盘灯光图片
const keyLightImages = import.meta.glob('@/assets/images/dynamic*.svg', { eager: true });

const checkFalse = new URL('@/assets/images/check_false.svg', import.meta.url).href;
const checkTrue = new URL('@/assets/images/check_true.svg', import.meta.url).href;
const restIcon = new URL('@/assets/images/rest_icon.svg', import.meta.url).href;

const { isCheckVersion: isCheckVersion1090 } = useVersionHooks('1.0.9.0');

const { locale } = useI18n();
const lightingStore = useLightingStore();
const globalStore = useGlobalStore();
const sleepTimeValue = ref('0');
const nowTab = ref(0);

const sleepTimeOptions = ref([
  { lable: '1 min', value: '1' },
  { lable: '5 min', value: '5' },
  { lable: '10 min', value: '10' },
  { lable: '30 min', value: '30' },
  { lable: '永不休眠', value: '0' },
]);

const onChangeTab = (data) => {
  nowTab.value = Number(data);
};

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

const clickHandler = (value: any) => {
  console.log('click', value);
};

console.log('area', area.value, lightingArea.value);

const lightingEffectModes = computed(() => {
  // 从灯效区域获取当前总数
  const { count } = lightingArea.value[areaIndex.value];
  return LIGHT_DYNAMIC_MODES.slice(0, count);
});

const getImagePath = (idx) => {
  const key = Object.keys(keyLightImages).find((path) => path.includes(`dynamic${idx + 1}.svg`));
  return key;
};

services.on(EVENT.LIGHTINGBASE, async (data: any) => {
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
