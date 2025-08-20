<template>
  <div
    :class="{
      draggable: !hold && keyValue,
      draggable_hold: hold,
      active: active,
    }"
    :style="{ opacity: keyValue === 0 || keyValue === 9999 ? 0 : 1 }"
    :draggable="Boolean(keyValue)"
    @click="handleClick"
    @dragstart="dragstart"
  >
    <p>{{ keyText }}</p>
    <span v-if="macroLength > 0" class="macro-length">{{ macroLength }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useKeyboardStore } from '@/store';

const keyboardStore = useKeyboardStore();

const { keyValue, macroLength, active, keyIndex } = defineProps({
  keyValue: { type: Number, required: true },
  active: { type: Boolean, default: false },
  isGlobal: { type: Boolean, default: false },
  macroLength: { type: Number, default: 0 },
  keyIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['chooseMacro']);

const keyText = computed(() => {
  return keyboardMap[keyValue]?.name || '';
});

const dragstart = (e) => {
  e.stopPropagation();
  // 更新全局缓存
  keyboardStore.updateSelectKeycode(keyValue);
};

const handleClick = () => {
  keyboardStore.updateSelectKeycode(keyValue);
  emit('chooseMacro', keyIndex);
};

const hold = computed(() => {
  const value = [61696, 61697, 61698, 61699, 61704, 61705, 61706, 61707, 61708].includes(keyValue.value);
  return value;
});
</script>

<style lang="less" scoped>
@import './styles/key.less';
</style>
