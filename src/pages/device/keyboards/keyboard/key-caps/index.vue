<template>
  <div class="key" :class="{ active: active && performanceTab !== 4 && !isNoKey }" @click="handleClick">
    <div class="key-cap">
      <div
        v-if="keyBorder2.width !== '0px'"
        v-px2rem="{
          styles: () => ({ ...keyBorder2 }),
        }"
        class="key-border"
      ></div>
      <div
        v-px2rem="{
          styles: () => ({ ...keyBorder }),
        }"
        class="key-border"
        :style="{ borderColor: performanceTab == 4 ? calibrationStatus.color : '' }"
      ></div>

      <div
        v-if="keyBorder2.width !== '0px'"
        v-px2rem="{
          styles: () => ({ ...keyBorder2Cover }),
        }"
      ></div>
      <template>
        <template v-if="!noShowTooltip">
          <div v-for="(line, idx) in tipInfo" :key="idx">{{ line }}</div>
        </template>
        <div v-if="keyTip && noShowTooltip">{{ keyTip }}</div>
      </template>
      <div v-px2rem="{ styles: () => ({ ...keyLabels }) }" variant="outline" class="key-labels">
        <template v-if="isIcon">
          <img v-if="svgPath" draggable="false" :src="svgPath" class="key-icon" />
          <span v-else>{{ keyCode }}</span>
        </template>
        <template v-else>
          {{ keyCode }}
        </template>
      </div>
      <!-- <t-tooltip>
        <template #content>
          <template v-if="!noShowTooltip">
            <div v-for="(line, idx) in tipInfo" :key="idx">{{ line }}</div>
          </template>
          <div v-if="keyTip && noShowTooltip">{{ keyTip }}</div>
        </template>
        <div v-px2rem="{ styles: () => ({ ...keyLabels }) }" variant="outline" class="key-labels">
          <template v-if="isIcon">
            <img v-if="svgPath" draggable="false" :src="svgPath" class="key-icon" />
            <span v-else>{{ keyCode }}</span>
          </template>
          <template v-else>
            {{ keyCode }}
          </template>
        </div>
      </t-tooltip> -->
      <!-- 自定义按键的数据 -->
      <div
        v-if="currentPageName === 'customKey' && isCheckVersion"
        v-px2rem="{
          styles: () => ({
            top: keyBorder.top,
            left: keyBorder.left,
            width: keyBorder.width,
            height: keyBorder.height,
          }),
        }"
        class="key-custom"
      >
        <span v-show="defaultKeycode !== bindKeyValue && defaultKeycode !== -1" class="key-custom-right"> </span>
      </div>
      <!-- 性能模式下数据 -->
      <div
        v-if="currentPageName === 'performance' && !isNoKey"
        v-px2rem="{
          styles: () => ({
            top: keyBorder.top,
            left: keyBorder.left,
            width: keyBorder.width,
            height: keyBorder.height,
          }),
        }"
        class="key-travel"
      >
        <span v-if="singleTravel !== null && !isRTMode" class="key-travel-center">
          {{ singleTravel }}
        </span>
        <template v-if="isRTMode">
          <span v-if="rtFirstTouchTravel !== null" class="key-travel-right">
            {{ rtFirstTouchTravel }}
          </span>
          <span v-if="rtPressTravel !== null" class="key-travel-left_bottom">
            {{ rtPressTravel }}
          </span>
          <span v-if="rtReleaseTravel !== null" class="key-travel-right_bottom">
            {{ rtReleaseTravel }}
          </span>
        </template>
        <template v-if="performanceTab === 2">
          <span v-if="pressDeadTravel !== null" class="key-travel-left">
            {{ pressDeadTravel }}
          </span>
          <span v-if="releaseDead !== null" class="key-travel-right_bottom">
            {{ releaseDead }}
          </span>
        </template>
        <template v-if="performanceTab === 4">
          <!-- <span v-if="calibrationData !== null" class="key-travel-left_bottom">
            {{ calibrationData }}
          </span> -->
          <!-- <span v-if="travels !== null" class="key-travel-right_bottom">
            {{ travels }}
          </span> -->
          <!-- <span class="key-travel-center_top" :style="`color:${calibrationStatus.color}`">
            {{ calibrationStatus.text }}
          </span> -->
        </template>
      </div>
      <!-- 性能模式下的校准 -->
      <template v-if="currentPageName === 'performance' && performanceTab === 3 && !isNoKey">
        <div
          v-px2rem="{
            styles: () => ({
              top: keyBorder.top,
              left: keyBorder.left,
              width: keyBorder.width,
              height: keyBorder.height,
            }),
          }"
          class="key-axis"
        >
          <div
            v-px2rem="{
              styles: () => ({
                position: 'absolute',
                top: '-3px',
                left: '100%',
                fontSize: '9px',
                transform: 'translateX(-100%)',
                alignItems: 'flex-start',
                color: axisVal?.axis_color || 'transparent',
              }),
            }"
          >
            <!-- <p>{{ axisVal?.axis_name }}</p> -->
            <span :style="{ background: axisVal?.axis_color }"></span>
          </div>
        </div>
      </template>
      <!-- 高级键 -->
      <template
        v-if="
          ['highLevelKey', 'customKey', 'macro'].includes(currentPageName) &&
          fnLayer === 0 &&
          advancedTag !== null &&
          !isNoKey
        "
      >
        <div
          v-px2rem="{ styles: () => ({ top: keyBorder.top, left: keyBorder.left, width: keyBorder.width }) }"
          class="key-advanced"
        >
          <span>{{ advancedTag }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Key' });
import { ref, watch, computed } from 'vue';
import { useKeyboardStore } from '@/store/modules/keyboard';
import { useGlobalStore } from '@/store/modules/globalSetting';
import { usePerformanceHook } from './hooks/usePerformanceHook';
import { useStyleKeyCapsHook } from './hooks/useStyleKeyCapsHook';
import { ICON_MAP } from '@/config/constant/index';
import { useVersionHooks } from '@/hooks/version/useVersionHooks';
import { t } from '@/locales';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';

const emit = defineEmits(['click']);

const props = defineProps({
  shapeScale: { type: Object, default: () => ({ w: 1, h: 1, w2: 0, h2: 0 }) },
  location: { type: Object, default: () => ({ x: 0, y: 0 }) },
  active: { type: Boolean, default: false },
  row: { type: Number, default: 0 },
  column: { type: Number, default: 0 },
  currentPageName: { type: String, default: 'performance' },
});
const keyboardStore = useKeyboardStore();
const globalStore = useGlobalStore();
const { isCheckVersion } = useVersionHooks('1.0.6.0');
const { shapeScale, location, row: rowIndex, column: colIndex } = props;
const { fnLayer } = storeToRefs(keyboardStore);
const defaultKeycode = computed(() => {
  return keyboardStore.keyboardLayout[rowIndex][colIndex].customKeys[globalStore.system.toLowerCase()][
    `fn${fnLayer.value}`
  ].defaultKeycode;
});
const bindKeyValue = computed(() => {
  return keyboardStore.keyboardLayout[rowIndex][colIndex].customKeys[globalStore.system.toLowerCase()][
    `fn${fnLayer.value}`
  ].bindKeyValue;
});
const active = toRef(props, 'active');
const currentPageName = toRef(props, 'currentPageName');
const { keyCode, keyBorder, keyBorder2, keyLabels, isIcon, keyBorder2Cover } = useStyleKeyCapsHook(rowIndex, colIndex, {
  shapeScale,
  location,
});
const svgPath = ref('');
const isNoKey = computed(() => {
  return keyboardStore.keyLayoutStyle[rowIndex][colIndex].type !== 'key';
});
// 首次触发，快速触发
const {
  singleTravel,
  rtFirstTouchTravel,
  rtPressTravel,
  rtReleaseTravel,
  releaseDead,
  pressDeadTravel,
  calibrationData,
  calibrationStatus,
  advancedTag,
  isRTMode,
  axisVal,
  performanceTab,
} = usePerformanceHook(rowIndex, colIndex, currentPageName);

const tipInfo = computed(() => {
  if (isRTMode.value) {
    return [
      t('messages.rtMode'),
      `${t('messages.triggerTravel')}: ${rtFirstTouchTravel.value ?? '-'}mm`,
      `${t('messages.pressTravel')}: ${rtPressTravel.value ?? '-'}mm`,
      `${t('messages.releaseTravel')}: ${rtReleaseTravel.value ?? '-'}mm`,
    ];
  }
  return [t('messages.firstTriggerMode'), `${t('messages.triggerTravel')}: ${singleTravel.value ?? '-'}mm`];
});

const noShowTooltip = computed(() => {
  const result = !(currentPageName.value === 'performance' && performanceTab.value === 0 && !isNoKey.value);
  return result;
});

watch(
  [keyCode, isIcon],
  ([newCode, isIconValue]) => {
    if (newCode && isIconValue) {
      svgPath.value = ICON_MAP[newCode];
    } else {
      svgPath.value = '';
    }
  },
  { immediate: true },
);

const keyTip = computed(() => {
  const tip = t(`messages.keyTip_${keyCode.value}`);
  if (tip && tip !== `messages.keyTip_${keyCode.value}`) {
    return tip;
  }
  return keyboardMap[keyCode.value]?.comm || keyboardMap[keyCode.value]?.name || '';
});

const handleClick = (e: MouseEvent) => {
  if (isNoKey.value) return;
  e.stopPropagation();
  emit('click');
};
</script>

<style lang="less" scoped>
@import './index.less';
</style>
