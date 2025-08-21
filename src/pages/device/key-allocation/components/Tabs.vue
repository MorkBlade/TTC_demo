<template>
  <div class="tabs-container">
    <div class="top-menu">
      <div
        v-for="(item, idx) in TabMenu"
        :key="idx"
        class="tab-menu-item"
        :class="idx === tabItem ? 'is-active' : ''"
        @click="changeTabMenu(idx)"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  TabMenu: {
    type: Array,
    default: () => [],
  },
});
const tabItem = ref(0);
const emits = defineEmits(['change']);
const changeTabMenu = (idx) => {
  tabItem.value = idx;
  emits('change', idx);
};
</script>

<style scoped lang="less">
.tabs-container {
  display: flex;
  .top-menu {
    width: 100%;
    height: 60px;
    display: flex;
    .tab-menu-item {
      width: 150px;
      height: 60px;
      font-size: 14px;
      background-image: url('@/assets/images/unselect.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      color: #fff;
      margin-right: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &:hover {
        background-image: url('@/assets/images/select_hover.png');
      }
    }
    .is-active {
      background-image: url('@/assets/images/mysetting_bg.png');
      &:hover {
        background-image: url('@/assets/images/mysetting_bg.png');
      }
    }
  }
}
</style>
