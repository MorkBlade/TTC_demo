<template>
  <div class="tabs-container">
    <tabs :TabMenu="menu" @change="changeMenu" />
    <div>
      <standard-key v-if="clickItem === 0" />
      <advanced-key v-if="clickItem === 1" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StandardKey from './standard/index.vue';
import AdvancedKey from './advanced/index.vue';
// import TabsL2 from './components/Tabs-L2.vue';
import Tabs from './components/Tabs.vue';

const menu = ['标准按键', '高级按键'];
const clickItem = ref(0);
const changeMenu = (idx) => {
  clickItem.value = idx;
};
</script>

<style scoped lang="less">
.tabs-container {
  display: flex;
  flex-direction: column;
  .top-menu {
    width: 100%;
    height: 60px;
    display: flex;
  }
}
</style>
