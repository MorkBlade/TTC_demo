<template>
  <div class="end-container">
    <div class="end-container__key">
      <p>{{ t('messages.endPress') }}</p>
      <div class="key-box" @mouseenter="onMouseEn(0)" @mouseleave="onMouseLe(0)">
        <p class="key" @dragenter="(e) => e.preventDefault()" @dragover="(e) => e.preventDefault()" @drop="Keydrop(0)">
          {{ keyText[0] }}
        </p>
        <div v-show="endInfo.dks && keyIndex === 0" class="del_btn" @click="onClick"></div>
      </div>
    </div>
    <div class="end-container__key1">
      <p>{{ t('messages.endRelease') }}</p>
      <span @click="isShow = true">
        {{ t('messages.endDelay') }}<u>{{ ` ${endInfo.delay}ms` }}</u>
      </span>
      <div class="key-box" @mouseenter="onMouseEn(1)" @mouseleave="onMouseLe(1)">
        <p class="key" @dragenter="(e) => e.preventDefault()" @dragover="(e) => e.preventDefault()" @drop="Keydrop(1)">
          {{ keyText[1] }}
        </p>
        <div v-show="endInfo.dks && keyIndex === 0" class="del_btn" @click="onClick"></div>
      </div>
    </div>
    <delaySlider v-model:is-show="isShow" :delay="endInfo.delay" @change-delay="changeEndDelay"></delaySlider>
  </div>
</template>

<script setup>
import delaySlider from '@/components/delay-slider/index.vue';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import { filterAdvancedKey } from '@/utils/filter-key.ts';
import { t } from '@/locales';

const endInfo = defineModel('endInfo', {
  type: Object,
  default: () => ({ dks: [0, 0], delay: 200 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHigherKeyStore();

const keyIndex = ref(-1);
const isShow = ref(false);

const keyText = computed(() => {
  return [keyboardMap[endInfo.value.dks[0]]?.name || '', keyboardMap[endInfo.value.dks[1]]?.name || ''];
});

const onMouseEn = (index) => {
  if (endInfo.value.dks[index]) keyIndex.value = index;
};

const onMouseLe = () => {
  keyIndex.value = -1;
};

const changeEndDelay = (delay) => {
  endInfo.value.delay = delay;
};

const onClick = () => {
  if (endInfo.value.dks) {
    endInfo.value.dks = [0, 0];
    keyIndex.value = -1;
  }
};

const Keydrop = (index) => {
  filterAdvancedKey(keyboardStore.keyboardLayout, keyboardStore.selectKey.keycode);
  endInfo.value.dks[index] = keyboardStore.selectKey.keycode;
};

const save = async () => {
  const { keyboardLayout } = keyboardStore;
  let key = 0;
  let row = 0;
  let col = 0;
  // 检查dks数组是否全为0
  if (endInfo.value.dks.every((value) => value === 0)) {
    return 'atLeastOneKey';
  }
  if (edit) {
    key = editKey;
  } else {
    // 获取当前键盘的keycode
    const location = keyboardStore.activeKeys[0].split('-');
    const [rowIndex, colIndex] = location;
    const { keyValue } = keyboardLayout[rowIndex][colIndex];
    key = keyValue;
    row = +rowIndex;
    col = +colIndex;
  }
  const res = await highLevelKeyStore.setEnd({ key, row, col, ...endInfo.value });
  return res;
};

const reset = () => {
  endInfo.value.dks = [0, 0];
  endInfo.value.delay = 200;
  keyIndex.value = -1;
};

onBeforeUnmount(() => {
  reset();
});

defineExpose({ save, reset });
</script>

<style scoped lang="less">
@import './index.less';
</style>
