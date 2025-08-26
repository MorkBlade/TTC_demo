<template>
  <div class="mpt-container">
    <div v-for="idx in 3" :key="idx" class="mpt-container__key">
      <div class="key-box" @mouseenter="onMouseEn(idx - 1)" @mouseleave="onMouseLe(idx - 1)">
        <p
          class="key"
          :class="{ 'hover-bg': !mptInfo.dks[idx - 1] }"
          @dragenter="(e) => e.preventDefault()"
          @dragover="(e) => e.preventDefault()"
          @drop="Keydrop(idx - 1)"
        >
          {{ keyText[idx - 1] }}
        </p>
        <div v-show="keyText[idx - 1] && delKeyShow[idx - 1]" class="del_btn" @click="onClick(idx - 1)"></div>
      </div>
      <div class="key-slider">
        <div class="slider">
          <t-slider
            v-model="mptInfo.dbs[idx - 1]"
            :show-tooltip="true"
            :max="option.max"
            :min="option.min"
            :step="option.step"
            :tooltip-props="{ placement: 'bottom', content: mptInfo.dbs[idx - 1].toFixed(2) + t('messages.mptUnitMm') }"
          />
        </div>
        <div class="slider-value">{{ mptInfo.dbs[idx - 1] + t('messages.mptUnitMm') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import { filterAdvancedKey } from '@/utils/filter-key.ts';
import { t } from '@/locales';

const mptInfo = defineModel('mptInfo', {
  type: Object,
  default: () => ({ dks: [0, 0, 0], dbs: [0.5, 1.0, 1.5] }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHigherKeyStore();

const delKeyShow = ref([false, false, false]);

const keyText = computed(() => {
  return [
    keyboardMap[mptInfo.value.dks[0]]?.name || '',
    keyboardMap[mptInfo.value.dks[1]]?.name || '',
    keyboardMap[mptInfo.value.dks[2]]?.name || '',
  ];
});

const option = computed(() => {
  return { max: 3.3, min: 0.1, step: 0.1, tooltipVisible: true };
});

const onMouseEn = (idx) => {
  if (mptInfo.value.dks[idx]) delKeyShow.value[idx] = true;
};

const onMouseLe = (idx) => {
  delKeyShow.value[idx] = false;
};

const Keydrop = (idx) => {
  filterAdvancedKey(keyboardStore.keyboardLayout, keyboardStore.selectKey.keycode);
  mptInfo.value.dks[idx] = keyboardStore.selectKey.keycode;
};

const onClick = (idx) => {
  if (mptInfo.value.dks[idx]) {
    mptInfo.value.dks[idx] = 0;
    delKeyShow.value[idx] = false;
  }
};

const save = async () => {
  const { keyboardLayout } = keyboardStore;
  let key = 0;
  let row = 0;
  let col = 0;
  // 检查dks数组是否全为0
  if (mptInfo.value.dks.every((value) => value === 0)) {
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
  const res = await highLevelKeyStore.setMpt({ key, row, col, ...mptInfo.value });
  return res;
};

const reset = () => {
  mptInfo.value.dks = [0, 0, 0];
  mptInfo.value.dbs = [0.5, 1.0, 1.5];
  delKeyShow.value = [false, false, false];
};

onBeforeUnmount(() => {
  reset();
});

defineExpose({ save, reset });
</script>

<style scoped lang="less">
@import './index.less';
</style>
