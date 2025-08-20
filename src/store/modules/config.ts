import { defineStore } from 'pinia';
import { APP_MENU } from '@/config/constant/index';
import emitter from '@/utils/app-emitter';

const state = {
  activeMenu: 'performance',
  disableConfig: false,
  isCalibrationDialog: false,
  appMenu: APP_MENU,
  disabledMenu: [],
};

export const useConfigStore = defineStore('config', {
  state: () => state,
  actions: {
    // 设置当前激活的菜单并跳转
    setActiveMenu(menu: string) {
      this.activeMenu = menu;
      this.disableConfig = false;
      emitter.emit('menu-click', { value: this.activeMenu });
    },
    // 设置禁用的菜单
    setDisabledMenu(menu: string[]) {
      this.disabledMenu = menu;
    },
    // 设置当前激活的菜单,其他菜单全禁用
    setActiveMenuAndDisableOthers(menu: string) {
      this.activeMenu = menu;
      this.disableConfig = true;
      this.disabledMenu = this.appMenu.filter((item) => item.key !== menu).map((item) => item.key);
      emitter.emit('menu-click', { value: this.activeMenu });
    },
    // 设置所有菜单禁用
    setAllDisabledMenu() {
      this.disabledMenu = this.appMenu.map((item) => item.key);
    },
    // 设置所有菜单启用
    setAllEnabledMenu() {
      this.disabledMenu = [];
      this.disableConfig = false;
    },
  },
});
