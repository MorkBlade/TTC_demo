<template>
  <div class="mt-container">
    <div class="mt-container__click">
      <p>{{ t('messages.mtClick') }}</p>
      <span @click="isShow = true">
        {{ t('messages.mtClickDelayLess') }}<u>{{ ` ${mtInfo.delay}ms` }}</u>
      </span>
      <!-- :class="{ 'hover-bg': !mtInfo.dks[0] }" -->
      <div class="key-box" @mouseenter="onMouseEn('click')" @mouseleave="onMouseLe('click')">
        <p class="key" @dragenter="(e) => e.preventDefault()" @dragover="(e) => e.preventDefault()" @drop="KeydropSec">
          {{ keyText[0] }}
        </p>
        <div v-show="mtInfo.dks[0] && clickDelIndex === 0" class="del_btn" @click="onClick"></div>
      </div>
    </div>
    <div class="mt-container__hold">
      <p>{{ t('messages.mtLong') }}</p>
      <span @click="isShow = true">
        {{ t('messages.mtLongDelayMore') }}<u>{{ ` ${mtInfo.delay}ms` }}</u>
      </span>
      <!-- :class="{ 'hover-bg': !mtInfo.dks[0] }" -->
      <div class="key-box" @mouseenter="onMouseEn" @mouseleave="onMouseLe">
        <p
          class="key"
          @dragenter="(e) => e.preventDefault()"
          @dragover="(e) => e.preventDefault()"
          @drop="KeydropFirst"
        >
          {{ keyText[1] }}
        </p>
        <div v-show="mtInfo.dks[1] && longDelIndex === 0" class="del_btn" @click="onLongPress"></div>
      </div>
    </div>
    <delaySlider
      v-model:is-show="isShow"
      :title="t('messages.mtDelayTitle')"
      :delay="mtInfo.delay"
      @change-delay="changeMtDelay"
    ></delaySlider>
  </div>
</template>

<script setup>
import delaySlider from '@/components/delay-slider/index.vue';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import { filterAdvancedKey } from '@/utils/filter-key.ts';
import { t } from '@/locales';

const mtInfo = defineModel('mtInfo', {
  type: Object,
  default: () => ({ dks: [0, 0], delay: 200 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHigherKeyStore();
const clickDelIndex = ref(-1);
const longDelIndex = ref(-1);
const isShow = ref(false);

watch(
  () => mtInfo.value,
  (newVal) => {
    console.log('new mt info', newVal);
  },
);

const keyText = computed(() => {
  return [keyboardMap[mtInfo.value.dks[0]]?.name || '', keyboardMap[mtInfo.value.dks[1]]?.name || ''];
});

const onClick = () => {
  if (mtInfo.value.dks[0]) mtInfo.value.dks[0] = 0;
};

const onLongPress = () => {
  if (mtInfo.value.dks[1]) mtInfo.value.dks[1] = 0;
};

const onMouseEn = (keyCode) => {
  switch (keyCode) {
    case 'click':
      if (mtInfo.value.dks[0]) clickDelIndex.value = 0;
      break;
    default:
      if (mtInfo.value.dks[1]) longDelIndex.value = 0;
      break;
  }
};

const onMouseLe = (keyCode) => {
  switch (keyCode) {
    case 'click':
      clickDelIndex.value = -1;
      break;
    default:
      longDelIndex.value = -1;
      break;
  }
};

const KeydropFirst = () => {
  filterAdvancedKey(keyboardStore.keyboardLayout, keyboardStore.selectKey.keycode);
  // if (unBinding) {
  //   MessagePlugin.error('该键已绑定高级键，请重新选择');
  //   return;
  // }
  mtInfo.value.dks[1] = keyboardStore.selectKey.keycode;
};

const KeydropSec = () => {
  filterAdvancedKey(keyboardStore.keyboardLayout, keyboardStore.selectKey.keycode);
  // if (unBinding) {
  //   MessagePlugin.error('该键已绑定高级键，请重新选择');
  //   return;
  // }
  mtInfo.value.dks[0] = keyboardStore.selectKey.keycode;
};

const changeMtDelay = (delay) => {
  mtInfo.value.delay = delay;
};

const save = async () => {
  const { keyboardLayout } = keyboardStore;
  let key = 0;
  let row = 0;
  let col = 0;
  // 检查dks数组是否全为0
  if (mtInfo.value.dks.every((value) => value === 0)) {
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
  const res = await highLevelKeyStore.setMT({ key, row, col, ...mtInfo.value });
  // mtInfo.value.dks = [0, 0];
  // mtInfo.value.delay = 200;
  // clickDelIndex.value = -1;
  // longDelIndex.value = -1;
  return res;
};

const reset = () => {
  mtInfo.value.dks = [0, 0];
  mtInfo.value.delay = 200;
  clickDelIndex.value = -1;
  longDelIndex.value = -1;
};
// 组件销毁
onBeforeUnmount(() => {
  reset();
});

defineExpose({ save, reset });
</script>

<style scoped lang="less">
@import './index.less';
</style>
