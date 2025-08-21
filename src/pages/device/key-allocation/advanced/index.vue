<template>
  <div class="tabs-box">
    <div class="tab">
      <tabs-l2 :tabMenu="advancedKeyMenu" @change="onChangeTab" />
    </div>
    <!-- <div class="search">
      <div class="search-box">
        <div class="search-input">
          <input type="text" placeholder="搜索" />
        </div>
      </div>
    </div> -->
  </div>
  <div class="content">
    <!-- 已激活高级键 -->
    <actived-key />
    <!-- 设置区域 -->
    <socd-box />
    <!-- 按键区 -->
    <key-box />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import TabsL2 from '../components/Tabs-L2.vue';
import ActivedKey from './components/ActivedKey.vue';
import SocdBox from './components/SOCD.vue';
import KeyBox from './components/KeyBox.vue';

const { t } = useI18n();

const advancedKeyMenu = computed(() => [
  { label: t('messages.activedHighKey'), value: 0 },
  { label: t('messages.highKeyMenuSocd'), value: 'socd' },
  { label: t('messages.highKeyMenuDks'), value: 'dks' },
  { label: t('messages.highKeyMenuMpt'), value: 'mpt' },
  { label: t('messages.highKeyMenuMt'), value: 'mt' },
  { label: t('messages.highKeyMenuTgl'), value: 'tgl' },
  { label: t('messages.highKeyMenuEnd'), value: 'end' },
  // { label: t('messages.highKeyMenuRs'), value: 'rs' },
]);
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
  justify-content: space-between;
  gap: 20px;
}
</style>
