<template>
  <div class="key-box">
    <tabs-l2 :tabMenu="keyMenu" v-model="tabItem" @change="onChangeTab" />
    <div class="character-card-box">
      <template v-if="tabItem === 0">
        <key
          v-for="item in keyboardMapByType.basic"
          :key="item"
          style="margin-right: 5px"
          :iszw="item === 0"
          :active="selectKey.keycode === item"
          :key-value="item"
        ></key>
      </template>
      <template v-if="tabItem === 3">
        <key
          v-for="item in keyboardMapByType.special"
          :key="item"
          style="margin-right: 5px"
          :iszw="item === 0"
          :active="selectKey.keycode === item"
          :key-value="item"
        ></key>
      </template>
      <template v-if="tabItem === 1">
        <key
          v-for="item in keyboardMapByType.light"
          :key="item"
          style="margin-right: 5px"
          :iszw="item === 0"
          :active="selectKey.keycode === item"
          :key-value="item"
        ></key>
      </template>
      <template v-if="tabItem === 2">
        <key
          v-for="item in keyboardMapByType.mouse"
          :key="item"
          style="margin-right: 5px"
          :iszw="item === 0"
          :active="selectKey.keycode === item"
          :key-value="item"
        ></key>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { keyboardMapByType } from '@/config/byte-to-key/keyboard-map';
import TabsL2 from '../../components/Tabs-L2.vue';
import { useKeyboardStore } from '@/store';

const keyboardStore = useKeyboardStore();

const keyMenu = [
  {
    label: '基础按键',
    value: 0,
  },
  {
    label: '特殊按键',
    value: 3,
  },
  {
    label: '灯效按键',
    value: 1,
  },
  {
    label: '鼠标按键',
    value: 2,
  },
];

const tabItem = ref(0);

const onChangeTab = (val: number) => {
  tabItem.value = val;
};

const selectKey = computed(() => keyboardStore.selectKey);
</script>

<style scoped lang="less">
.key-box {
  flex: 1;
  width: 902px;
  height: 340px;
  margin-top: 28px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  // overflow-y: hidden;
}
.character-card-box {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  height: fit-content;
  min-height: 100px;
  max-height: 240px;
  overflow-y: auto;
  /* 美化滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 3px;
    /* 设置滚动条距离右侧边距,避免圆角溢出 */
    margin-right: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #383838;
    border-radius: 3px;
    /* 设置轨道距离右侧边距,避免圆角溢出 */
    margin-right: 4px;
  }
}
</style>
