<template>
  <div class="tgl-container">
    <div class="tgl-container__key">
      <p>{{ t('messages.tglClickHold') }}</p>
      <!-- <span @click="isShow = true">
        触发延迟
        <u>{{ ` ${tglInfo.delay}ms` }}</u>
      </span> -->
      <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
        <p
          class="key"
          @dragenter="(e) => e.preventDefault()"
          @dragover="(e) => e.preventDefault()"
          @drop="KeydropFirst"
        >
          {{ keyText }}
        </p>
        <div v-show="tglInfo.kc && keyIndex === 0" class="del_btn" @click="onClick"></div>
      </div>
    </div>
    <delaySlider v-model:is-show="isShow" :delay="tglInfo.delay" @change-delay="changeTglDelay"></delaySlider>
  </div>
</template>

<script setup>
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import delaySlider from '@/components/delay-slider/index.vue';
import { t } from '@/locales';

const tglInfo = defineModel('tglInfo', {
  type: Object,
  default: () => ({ kc: 0, delay: 200 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const highLevelKeyStore = useHigherKeyStore();
const keyboardStore = useKeyboardStore();

const isShow = ref(false);
const keyIndex = ref(-1);

const keyText = computed(() => {
  return keyboardMap[tglInfo.value.kc]?.name || '';
});

const onMouseEn = () => {
  if (tglInfo.value.kc) keyIndex.value = 0;
};

const onMouseLe = () => {
  keyIndex.value = -1;
};

const KeydropFirst = () => {
  tglInfo.value.kc = keyboardStore.selectKey.keycode;
};

const onClick = () => {
  if (tglInfo.value.kc) {
    tglInfo.value.kc = 0;
    keyIndex.value = -1;
  }
};

const changeTglDelay = (delay) => {
  tglInfo.value.delay = delay;
};

const save = async () => {
  const { keyboardLayout } = keyboardStore;
  let key = 0;
  let row = 0;
  let col = 0;
  // 检查dks数组是否全为0
  if (tglInfo.value.kc === 0) {
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
  const res = await highLevelKeyStore.setTGL({ key, row, col, ...tglInfo.value });
  tglInfo.value.dks = 0;
  tglInfo.value.delay = 200;
  return res;
};

const reset = () => {
  tglInfo.value.kc = 0;
  tglInfo.value.delay = 200;
};

onBeforeUnmount(() => {
  reset();
});
defineExpose({ save, reset });
</script>

<style scoped lang="less">
@import './index.less';
</style>
