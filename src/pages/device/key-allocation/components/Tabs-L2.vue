<template>
  <div class="tabs-container">
    <div class="top-menu">
      <div
        v-for="(item, idx) in tabMenu"
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

<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  tabMenu: {
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
    height: 34px;
    display: flex;
    gap: 20px;

    .tab-menu-item {
      width: 95px;
      display: flex;
      padding: 10px 16px;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      color: #fff;
      background: #383838;
      border: 2px solid #616161;
      cursor: pointer;

      &:hover {
        color: #09fbd3;
        border: 2px solid #09fbd3;
      }
    }

    .is-active {
      color: #09fbd3;
      border: 2px solid #09fbd3;
    }
  }
}
</style>
