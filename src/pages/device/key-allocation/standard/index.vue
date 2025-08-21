<template>
  <div class="tabs-box">
    <div class="tab">
      <tabs-l2 :tabMenu="menu" :click-item="clickItem" @change="changeMenu" />
    </div>
    <div class="search">
      <div class="search-box">
        <div class="search-input">
          <input type="text" placeholder="搜索" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TabsL2 from '../components/Tabs-L2.vue';

const menu = ['基础按键', '特殊按键', '灯效按键', '鼠标按键', '宏按键'];
const clickItem = ref(0);
const changeMenu = (idx) => {
  clickItem.value = idx;
};
</script>

<style scoped>
.tabs-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 20px;

  .tab {
    width: 600px;
  }

  .search {
    width: 300px;
  }
}
</style>
