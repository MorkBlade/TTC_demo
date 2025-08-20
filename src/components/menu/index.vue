<template>
  <div class="menu-container">
    <h4>{{ t('messages.menuTitle') }}</h4>
    <div
      v-for="menu in Menu"
      :key="menu.key"
      class="menu-item"
      :class="{
        actived: activeMenu === menu.key,
        disabled: disabledMenu.includes(menu.key),
      }"
      @click="handleMenuClick(menu.key)"
    >
      <icon-font :name="menu.icon" />
      <span>
        {{ t('messages.' + menu.key) }}
        <span v-if="menu.key === 'update' && hasNewVersion" class="update-dot"></span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconFont } from 'tdesign-icons-vue-next';
import emitter from '@/utils/app-emitter';
import { useConfigStore, useDeviceStore, useKeyboardStore, useDisplayerStore } from '@/store';
import { t } from '@/locales';

const deviceStore = useDeviceStore();
const configStore = useConfigStore();
const displayerStore = useDisplayerStore();
const { displayerInfo } = storeToRefs(displayerStore);
const { activeMenu, disabledMenu, appMenu } = storeToRefs(configStore);
const Menu = computed(() => {
  if (!displayerInfo.value.hasDisplay) {
    return appMenu.value.filter((item) => item.key !== 'screen');
  }
  return appMenu.value;
});

const { hasNewVersion } = storeToRefs(deviceStore);
const keyboardStore = useKeyboardStore();

const handleMenuClick = (value: string) => {
  if (disabledMenu.value.includes(value)) {
    return;
  }
  activeMenu.value = value;
  if (keyboardStore.fnLayer !== 0) {
    keyboardStore.getKeyLayout({ layer: 0 });
  }
  keyboardStore.fnLayer = 0;
  emitter.emit('menu-click', { value });
};
onMounted(() => {
  emitter.emit('menu-click', { value: activeMenu.value });
});
</script>

<style lang="less" scoped>
@import './index.less';
</style>
