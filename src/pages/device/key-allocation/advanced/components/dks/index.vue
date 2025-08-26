<template>
  <div class="dks-container">
    <!-- <div class="left-config"> -->
    <div class="title-box key-config">
      <h3>键程</h3>
    </div>
    <div class="title-box key-press">
      <h3>按下</h3>
      <div :style="{ display: 'flex' }">
        <div class="press-box">
          <p @click="setTravelDialog = true">0.01mm</p>
          <div class="icon icon-down"></div>
        </div>
        <div class="press-box">
          <p @click="setTravelDialog2 = true">3.30mm</p>
          <div class="icon icon-down-top"></div>
        </div>
      </div>
    </div>
    <div class="title-box key-up">
      <h3>抬起</h3>
      <div :style="{ display: 'flex' }">
        <div class="press-box">
          <p @click="setTravelDialog2 = true">0.01mm</p>
          <div class="icon icon-up"></div>
        </div>
        <div class="press-box">
          <p @click="setTravelDialog = true">3.30mm</p>
          <div class="icon icon-up-top"></div>
        </div>
      </div>
    </div>
    <!-- style="" -->
    <div class="dks-config-container">
      <div class="dks-btn-box">
        <div
          v-for="index in 4"
          :key="index"
          class="dks-btn"
          @dragenter.prevent
          @dragover.prevent
          @drop="Keydrop(index - 1)"
          @mouseenter="onMouseEnter(index - 1)"
          @mouseleave="onMouseLeave(index - 1)"
        >
          <p>{{ keyText[index - 1] }}</p>
          <div
            v-show="keyText[index - 1] && delKeyShow[index - 1]"
            class="dks-btn-del"
            @click="onDelKey(index - 1)"
          ></div>
        </div>
      </div>
      <div class="dks-container-box">
        <div v-for="(layer, layerIndex) in 4" :key="layerIndex" class="out-box">
          <div v-for="(item, itemIndex) in 4" :key="itemIndex" class="out-box-item">
            <div
              :class="{
                round: !clickData[layerIndex][itemIndex],
                'round-clicked': clickData[layerIndex][itemIndex],
              }"
              @click="roundClicked(layerIndex, itemIndex)"
            ></div>
            <div
              v-if="itemIndex < 3"
              :class="{
                line: !clickData[layerIndex][itemIndex] || !clickData[layerIndex][itemIndex + 1],
                'line-clicked': clickData[layerIndex][itemIndex] && clickData[layerIndex][itemIndex + 1],
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- delaySlider db1 -->
    <delaySlider
      v-model:is-show="setTravelDialog"
      :delay="dksInfo.db"
      :title="t('messages.dksMinTravel')"
      :min="0.1"
      :max="3.3"
      :step="0.1"
      @change-delay="changeDksDelay1"
    >
    </delaySlider>
    <!-- delaySlider db2 -->
    <delaySlider
      v-model:is-show="setTravelDialog2"
      :delay="dksInfo.db2"
      :min="0.1"
      :max="3.3"
      :step="0.1"
      :title="t('messages.dksMaxTravel')"
      @change-delay="changeDksDelay2"
    >
    </delaySlider>
  </div>
</template>

<script setup>
import delaySlider from '@/components/delay-slider/index.vue';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import { filterAdvancedKey } from '@/utils/filter-key.ts';
import { t } from '@/locales';

const dksInfo = defineModel('dksInfo', {
  type: Object,
  default: () => ({ dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.5, db2: 3.0 }),
});

const { edit, editKey } = defineProps({
  edit: { type: Boolean, default: false },
  editKey: { type: [String, Number], default: '' },
});

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHigherKeyStore();

const setTravelDialog = ref(false);
const setTravelDialog2 = ref(false);

const isDragStates = reactive({ 0: false, 1: false, 2: false, 3: false });
const widths = reactive({}); // 存储每个 span 的宽度
const currentKeys = reactive({ 0: null, 1: null, 2: null, 3: null });
const delKeyShow = reactive([false, false, false, false]);

const clickData = reactive([
  [false, false, false, false],
  [false, false, false, false],
  [false, false, false, false],
  [false, false, false, false],
]);

// const db = computed(() => dksInfo.value.db);

// const db2 = computed(() => dksInfo.value.db2);

const keyText = computed(() => {
  return [
    keyboardMap[dksInfo.value.dks[0]]?.name || '',
    keyboardMap[dksInfo.value.dks[1]]?.name || '',
    keyboardMap[dksInfo.value.dks[2]]?.name || '',
    keyboardMap[dksInfo.value.dks[3]]?.name || '',
  ];
});

const parse8BitToBooleans = (num) => {
  const result = [false, false, false, false];
  const bits = new Array(8);

  for (let i = 0; i < 8; i++) {
    // eslint-disable-next-line no-bitwise
    bits[i] = !!(num & (1 << i));
  }
  // 只保留4个round的状态
  for (let i = 0; i < 4; i++) {
    result[i] = bits[i];
  }

  return result;
};

const clickDataTranfromTrps = () => {
  let buf = 0;
  for (let i = 0; i < 4; i++) {
    buf = 0;
    // 只处理4个round的状态
    if (clickData[i][0] === true) {
      buf |= 1 << 0;
    }
    if (clickData[i][1] === true) {
      buf |= 1 << 1;
    }
    if (clickData[i][2] === true) {
      buf |= 1 << 2;
    }
    if (clickData[i][3] === true) {
      buf |= 1 << 3;
    }
    dksInfo.value.trps[i] = buf;
  }
};

const onMouseEnter = (idx) => {
  if (dksInfo.value.dks[idx]) delKeyShow[idx] = true;
};

const onMouseLeave = (idx) => {
  delKeyShow[idx] = false;
};

const Keydrop = (idx) => {
  filterAdvancedKey(keyboardStore.keyboardLayout, keyboardStore.selectKey.keycode);
  dksInfo.value.dks[idx] = keyboardStore.selectKey.keycode;
};

// 删除操作
const onDelKey = (idx) => {
  if (dksInfo.value.dks[idx]) {
    dksInfo.value.dks[idx] = 0;
    dksInfo.value.trps[idx] = 0;
    delKeyShow[idx] = false;
  }
};

const roundClicked = (row, col) => {
  clickData[row][col] = !clickData[row][col];
};

const changeDksDelay1 = (delay) => {
  dksInfo.value.db = delay;
};

const changeDksDelay2 = (delay) => {
  dksInfo.value.db2 = delay;
};

const save = async () => {
  const { keyboardLayout } = keyboardStore;
  let key = 0;
  let row = 0;
  let col = 0;
  clickDataTranfromTrps();

  // 检查dks数组是否全为0
  if (dksInfo.value.dks.every((value) => value === 0)) {
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
  const res = await highLevelKeyStore.setDks({ key, row, col, ...dksInfo.value });
  return res;
};

const reset = () => {
  // 重置DKS组件状态
  dksInfo.value.dks = [0, 0, 0, 0];
  dksInfo.value.trps = [0, 0, 0, 0];
  dksInfo.value.db = 1.5;
  dksInfo.value.db2 = 3.0;

  // 重置拖拽和点击状态
  for (let i = 0; i < 4; i++) {
    isDragStates[i] = false;
    currentKeys[i] = null;
    delKeyShow[i] = false;
    clickData[i] = [false, false, false, false];
  }

  // 重置宽度
  Object.keys(widths).forEach((key) => {
    widths[key] = 20;
  });
};

watchEffect(() => {
  for (let i = 0; i < 4; i++) {
    clickData[i] = parse8BitToBooleans(dksInfo.value.trps[i]);
  }
});

onBeforeUnmount(() => {
  reset();
});

defineExpose({ save, reset });
</script>

<style scoped lang="less">
@import './index.less';
</style>
