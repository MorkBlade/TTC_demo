<template>
  <div class="actived-key">
    <div class="actived-key-item">
      <div class="actived-key-item-title">已激活高级键</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
// import { useKeyboardStore, useHigherKeyStore } from '@/store';
import useSetAdvanced from '../hook/useSetAdvanced';

const { advancedItems } = useSetAdvanced();

// const higherKeyStore = useHigherKeyStore();
// const keyboardStore = useKeyboardStore();

onMounted(async () => {
  console.log('ActivedKey mounted', advancedItems.value);
});
</script>

<style scoped lang="less">
.actived-key {
  width: 260px;
  height: 340px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
