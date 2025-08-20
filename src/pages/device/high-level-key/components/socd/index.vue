<template>
  <div class="socd-container">
    <div class="socd-container__mode">
      <div
        v-for="ite in SOCD_MODES"
        :key="ite.mode"
        class="mode-btn"
        :class="{ active: socdInfo.mode === ite.mode }"
        @click="changeMode(ite.mode)"
      >
        {{ t('messages.' + ite.nameKey) }}
      </div>
    </div>
    <div class="socd-container__key">
      <div class="socd-container__key-box">
        <div class="key-item">
          <p>{{ t('messages.socdKeyA') }}</p>
          <div class="key-box" @mouseenter="onMouseEn(0)" @mouseleave="onMouseLe(0)">
            <p
              class="key"
              @dragenter="(e) => e.preventDefault()"
              @dragover="(e) => e.preventDefault()"
              @drop="handleKeydrop(0)"
            >
              {{ keyText[0] }}
            </p>
            <div v-show="socdInfo.kcs[0] && keyIndex[0] === 0" class="del_btn" @click="handleDelClick(0)"></div>
          </div>
        </div>
        <div class="key-item">
          <p>{{ t('messages.socdKeyB') }}</p>
          <div class="key-box" @mouseenter="onMouseEn(1)" @mouseleave="onMouseLe(1)">
            <p
              class="key"
              @dragenter="(e) => e.preventDefault()"
              @dragover="(e) => e.preventDefault()"
              @drop="handleKeydrop(1)"
            >
              {{ keyText[1] }}
            </p>
            <div v-show="socdInfo.kcs[1] && keyIndex[1] === 0" class="del_btn" @click="handleDelClick(1)"></div>
          </div>
        </div>
      </div>
      <span @click="isShow = true">
        {{ t('messages.socdDelay') }}<u>{{ ` ${socdInfo.delay}ms` }}</u>
      </span>
    </div>
  </div>
  <delaySlider
    v-model:is-show="isShow"
    :max="50"
    :title="t('messages.socdDelay')"
    :delay="socdInfo.delay"
    @change-delay="handleSocdDelay"
  >
  </delaySlider>
</template>
<script setup>
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { SOCD_MODES } from '@/constants/higherKey';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import { filterAdvancedKey } from '@/utils/filter-key.ts';
import delaySlider from '@/components/delay-slider/index.vue';
import { t } from '@/locales';

const isShow = ref(false);
const socdInfo = defineModel('socdInfo', {
  type: Object,
  default: () => ({
    pos: [
      { row: 0, col: 0 },
      { row: 0, col: 0 },
    ],
    kcs: [0, 0],
    type: 0,
    mode: 0,
    delay: 0,
  }),
});

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHigherKeyStore();

const keyIndex = ref([-1, -1]);

const keyText = computed(() => {
  return [keyboardMap[socdInfo.value.kcs[0]]?.name || '', keyboardMap[socdInfo.value.kcs[1]]?.name || ''];
});

const changeMode = (mode) => {
  socdInfo.value.mode = mode;
};

const onMouseEn = (idx) => {
  if (socdInfo.value.kcs[idx]) keyIndex.value[idx] = 0;
};

const onMouseLe = (idx) => {
  keyIndex.value[idx] = -1;
};

const handleKeydrop = (idx) => {
  filterAdvancedKey(keyboardStore.keyboardLayout, keyboardStore.selectKey.keycode);
  const keyVal = keyboardStore.selectKey.keycode;
  socdInfo.value.kcs[idx] = keyVal;
};

const handleSocdDelay = (delay) => {
  socdInfo.value.delay = delay;
};

const handleDelClick = (idx) => {
  if (socdInfo.value.kcs[idx]) {
    socdInfo.value.pos[idx] = 0;
    socdInfo.value.kcs[idx] = 0;
    keyIndex.value[idx] = -1;
  }
};

const save = async () => {
  try {
    if (keyboardStore.activeKeys.length < 2) return 'twoKeys';
    const [[row, col], [row2, col2]] = keyboardStore.activeKeys.map((item) => item.split('-').map(Number));
    const { kcs, mode, delay } = socdInfo.value;
    const data = { row, col, row2, col2, kcs, mode, delay };
    const res = await highLevelKeyStore.setSocd(data);
    return res;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

const reset = () => {
  socdInfo.value.pos = [
    { row: 0, col: 0 },
    { row: 0, col: 0 },
  ];
  socdInfo.value.key = [0, 0];
  socdInfo.value.type = 0;
  socdInfo.value.mode = 0;
  keyIndex.value = [-1, -1];
};

onBeforeUnmount(() => {
  reset();
});

defineExpose({ save, reset });
</script>

<style scoped lang="less">
@import './index.less';
</style>
