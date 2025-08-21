<template>
  <div
    :class="{
      draggable: (!hold && keyValue) || iszw,
      draggable_hold: hold,
      active: active,
      [`width-${isGlobal ? matchKeyHeight(keyValue) : ''}`]: true,
    }"
    :style="{ opacity: keyValue === 9999 ? 0 : 1 }"
    :draggable="isDraggable"
    @click="handleClick"
    @dragstart="dragstart"
  >
    <t-tooltip :content="keyTip">
      <template v-if="['media', 'light', 'control', 'mouse'].includes(keyType)">
        <img v-if="keyPath" :src="keyPath" class="key-icon" />
      </template>
      <p v-else>{{ keyText }}</p>
    </t-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '@/locales';

import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { KEYBOARD_GLOBAL } from '@/config/constant';
import { useKeyboardStore } from '@/store';
import { ICON_MAP } from '@/config/constant/index';

const keyboardStore = useKeyboardStore();

const { keyValue, isPositionKey } = defineProps({
  keyValue: { type: Number, required: true },
  active: { type: Boolean, default: false },
  isGlobal: { type: Boolean, default: false },
  iszw: { type: Boolean, default: false },
  isPositionKey: { type: Boolean, default: false },
});

const keyText = computed(() => {
  return keyboardMap[keyValue]?.name || '';
});

const isDraggable = computed(() => {
  if (keyValue === 9999) {
    return false;
  }
  if (keyValue === 0 && !isPositionKey) {
    return true;
  }
  return Boolean(keyValue);
});

const keyType = computed(() => {
  return keyboardMap[keyValue]?.typeof || 'basic';
});

const keyPath = computed(() => {
  return ICON_MAP[keyValue];
});

const keyTip = computed(() => {
  const tip = t(`messages.keyTip_${keyValue}`);
  if (tip && tip !== `messages.keyTip_${keyValue}`) {
    return tip;
  }
  return keyboardMap[keyValue]?.comm || keyboardMap[keyValue]?.name || '';
});

const dragstart = (e) => {
  e.stopPropagation();
  // 更新全局缓存
  keyboardStore.updateSelectKeycode(keyValue);
};

const handleClick = () => {
  keyboardStore.updateSelectKeycode(keyValue);
};

const hold = computed(() => {
  const value = [61696, 61697, 61698, 61699, 61704, 61705, 61706, 61707, 61708].includes(keyValue.value);
  return value;
});

const matchKeyHeight = (keyValue) => {
  const height = KEYBOARD_GLOBAL[1].specialSize.find((ite) => ite[keyValue] !== undefined);
  const value = height ? `${height[keyValue]}` : `${50}`;
  return value;
};
</script>

<style lang="less" scoped>
.draggable {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;

  /* 使 div 的宽度随内容自动调整 */
  min-width: 25px;
  height: 50px;
  margin-right: 2px;
  margin-bottom: 2px;
  color: rgb(252 252 252 / 100%);
  font-weight: 700;
  font-size: 12px;
  background-color: #383838;
  border: 2px solid #616161;
  border-radius: 10px;
  cursor: grab;
  opacity: 1;

  > p {
    width: 100%;
    white-space: pre-wrap;
    text-align: center;
    word-wrap: break-word;
  }
}

.draggable_hold {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 使 div 的宽度随内容自动调整 */
  min-width: 50px;

  /* 可选：为 div 添加一些内边距 */
  height: 50px;
  margin: 10px;

  /* 设置 div 的最小宽度 */
  padding: 5px;
  background-color: rgb(255 221 193);
  border: 2px rgb(255 115 0) solid;
  border-radius: 16px;
}

.key-icon {
  width: 30px;
  height: 30px;
  color: #fff;
}
</style>
