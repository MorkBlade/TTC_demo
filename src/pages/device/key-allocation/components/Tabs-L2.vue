<template>
  <div class="tabs-container">
    <div class="top-menu">
      <div
        v-for="item in tabMenu"
        :key="item.value"
        class="tab-menu-item"
        :class="item.value === tabItem ? 'is-active' : ''"
        @click="changeTabMenu(item.value)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  tabMenu: {
    type: Array as PropType<Array<{ label: string; value: number }>>,
    default: () => [
      {
        label: String,
        value: Number,
      },
    ],
  },
});
const tabItem = ref(0);
const emits = defineEmits(['change']);
const changeTabMenu = (val: number) => {
  tabItem.value = val;
  emits('change', val);
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
      width: auto;
      display: flex;
      padding: 10px 16px;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      color: #fff;
      background: #383838;
      border: 2px solid #616161;
      cursor: pointer;
      white-space: nowrap;

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
