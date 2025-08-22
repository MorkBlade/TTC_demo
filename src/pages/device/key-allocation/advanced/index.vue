<template>
  <div class="tabs-box">
    <div class="tab">
      <tabs-l2 :tabMenu="advancedKeyMenu" v-model="tabItem" @change="onChangeTab" />
    </div>
  </div>
  <div class="content">
    <!-- 已激活高级键 -->
    <template v-if="tabItem === 0">
      <actived-key :advancedData="advancedItems" @toAdd="toAdd" @edit="edit" :addMenuItems="addMenuItems" />
    </template>

    <template v-else>
      <!-- 高级键列表 -->
      <advanced-key-list :advancedData="advancedItems" @activeAddNew="activeAddNew" />
      <!-- 设置区域 -->
      <div class="setting-box">
        <div class="setting-box-text">
          <div class="title">{{ addMenuItems.find((item) => item.value === tabItem)?.title }}</div>
          <div class="desc">{{ addMenuItems.find((item) => item.value === tabItem)?.desc }}</div>
        </div>
        <template v-if="tabItem === 'socd'">
          <!-- <socd-box /> -->
        </template>
        <template v-else-if="tabItem === 'dks'">
          <!-- <dks-box /> -->
        </template>
        <template v-else-if="tabItem === 'mpt'">
          <!-- <mpt-box /> -->
        </template>
        <template v-else-if="tabItem === 'mt'">
          <!-- <mt-box /> -->
        </template>
        <template v-else-if="tabItem === 'tgl'">
          <!-- <tgl-box /> -->
        </template>
        <template v-else-if="tabItem === 'end'">
          <!-- <end-box /> -->
        </template>
      </div>
      <!-- 按键区 -->
      <key-box />
    </template>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AdvancedKeyList from './components/ActivedKeyList.vue';
import TabsL2 from '../components/Tabs-L2.vue';
import ActivedKey from './components/ActivedKey.vue';
// import SocdBox from './components/SOCD.vue';
import KeyBox from './components/KeyBox.vue';
import useSetAdvanced from './hook/useSetAdvanced';
import { useHigherKeyStore } from '@/store';

const { advancedItems, resetDefaultValue } = useSetAdvanced();
const { deleteHighLevelKey } = useHigherKeyStore();

const { t } = useI18n();

const advancedKeyMenu = computed(() => [
  { label: t('messages.activedHighKey'), value: 0 },
  { label: t('messages.highKeyMenuSocd'), value: 'socd' },
  { label: t('messages.highKeyMenuDks'), value: 'dks' },
  { label: t('messages.highKeyMenuMpt'), value: 'mpt' },
  { label: t('messages.highKeyMenuMt'), value: 'mt' },
  { label: t('messages.highKeyMenuTgl'), value: 'tgl' },
  { label: t('messages.highKeyMenuEnd'), value: 'end' },
]);

const addMenuItems = [
  {
    title: '双效点击(MT)',
    desc: '单个按键实现2种功能：单击按键为一种， 长按按键为一种',
    value: 'mt',
  },
  {
    title: '动态键程(DKS)',
    desc: '单个按键实现四种功能，根据按压程度绑定按键功能',
    value: 'dks',
  },
  {
    title: '同时触发(SOCD)',
    desc: '绑定两个按键，并根据您的设置决定他们如何触发',
    value: 'socd',
  },
  {
    title: '多点触发(MPT)',
    desc: '单个按键实现绑定的三种功能',
    value: 'mpt',
  },
  {
    title: '切换开关(TGL)',
    desc: '单击按键可开关持续触发，按住案件则为正常触发行为',
    value: 'tgl',
  },
  {
    title: '松开触发(END)',
    desc: '松开触发是指在松开一个键的同时，触发另一个键的功能',
    value: 'end',
  },
];

const tabItem: Ref<string | number> = ref(0);
const onChangeTab = (val: number | string) => {
  tabItem.value = val;
};

const toAdd = (value: string) => {
  tabItem.value = value;
};

// 编辑
const edit = (value: { option: any; item: any }) => {
  const { option, item } = value;
  if (option.value === 3) {
    // TODO 删除
    deleteHighLevelKey({ row: item.row, col: item.col });
    resetDefaultValue();
    // showMessage('删除成功!');
    MessagePlugin.success('删除成功');
  }
};

// 添加对于新值
const activeAddNew = () => {
  console.log('activeAddNew', tabItem.value);
};

// 获取键盘中已经激活的高级键
onMounted(async () => {
  console.log('advancedItems', advancedItems.value);
});
</script>

<style scoped>
.tabs-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
  .tab {
    width: 600px;
  }

  .search {
    width: 300px;
  }
}
.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 20px;

  .setting-box {
    width: 400px;
    height: 340px;
    margin-top: 28px;
    margin-left: 60px;
    border-left: 2px solid #404040;
    border-right: 2px solid #404040;
    .setting-box-text {
      width: 100%;
      height: 40px;
      display: flex;
      flex-direction: column;
      justify-content: left;
      padding: 0 40px;
      gap: 5px;
      .title {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
      }
      .desc {
        font-size: 14px;
        font-weight: 400;
        color: #999999;
      }
    }
  }
}
</style>
