<template>
  <div class="socd-container">
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
            <div v-show="rsInfo.kcs[0] && keyIndex[0] === 0" class="del_btn" @click="handleDelClick(0)"></div>
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
            <div v-show="rsInfo.kcs[1] && keyIndex[1] === 0" class="del_btn" @click="handleDelClick(1)"></div>
          </div>
        </div>
      </div>
      <span @click="isShow = true">
        {{ t('messages.socdDelay') }}<u>{{ ` ${rsInfo.delay}ms` }}</u>
      </span>
    </div>
  </div>
  <delaySlider
    v-model:is-show="isShow"
    :max="50"
    :title="t('messages.socdDelay')"
    :delay="rsInfo.delay"
    @change-delay="handleSocdDelay"
  >
  </delaySlider>
</template>
<script setup>
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import { filterAdvancedKey } from '@/utils/filter-key.ts';
import delaySlider from '@/components/delay-slider/index.vue';
import { t } from '@/locales';

const isShow = ref(false);
const rsInfo = defineModel('rsInfo', {
  type: Object,
  default: () => ({
    kcs: [0, 0],
    delay: 0,
  }),
});
console.log('rsInfo88888', rsInfo.value);
// rsInfo.value.kcs = [4, 5];
// rsInfo.value.delay = 200;
const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHigherKeyStore();

const keyIndex = ref([-1, -1]);

const keyText = computed(() => {
  return [keyboardMap[rsInfo.value.kcs[0]]?.name || '', keyboardMap[rsInfo.value.kcs[1]]?.name || ''];
});

const onMouseEn = (idx) => {
  if (rsInfo.value.kcs[idx]) keyIndex.value[idx] = 0;
};

const onMouseLe = (idx) => {
  keyIndex.value[idx] = -1;
};

const handleKeydrop = (idx) => {
  filterAdvancedKey(keyboardStore.keyboardLayout, keyboardStore.selectKey.keycode);
  const keyVal = keyboardStore.selectKey.keycode;
  rsInfo.value.kcs[idx] = keyVal;
};

const handleSocdDelay = (delay) => {
  rsInfo.value.delay = delay;
};

const handleDelClick = (idx) => {
  if (rsInfo.value.kcs[idx]) {
    rsInfo.value.pos[idx] = 0;
    rsInfo.value.kcs[idx] = 0;
    keyIndex.value[idx] = -1;
  }
};

const save = async () => {
  try {
    if (keyboardStore.activeKeys.length < 2) return 'twoKeys';
    const [[row, col], [row2, col2]] = keyboardStore.activeKeys.map((item) => item.split('-').map(Number));
    const { kcs, delay } = rsInfo.value;
    const data = { row, col, row2, col2, kcs, delay };
    const res = await highLevelKeyStore.setRS(data);
    return res;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

const reset = () => {
  rsInfo.value.pos = [
    { row: 0, col: 0 },
    { row: 0, col: 0 },
  ];
  rsInfo.value.key = [0, 0];
  rsInfo.value.type = 0;
  rsInfo.value.mode = 0;
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
