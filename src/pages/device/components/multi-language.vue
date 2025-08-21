<template>
  <div class="multi-language-container">
    <div class="language-selector" @click="toggleDropdown" :class="{ disabled: disableConfig }">
      <!-- 主图标 -->
      <div class="language-icon">
        <langIcon class="global-icon" />
      </div>
      <!-- 下拉菜单 -->
      <div v-if="showDropdown" class="language-dropdown" @click.stop>
        <div
          v-for="option in languageOptions"
          :key="option.value"
          class="language-option"
          :class="{ active: currentLocale === option.value }"
          @click="selectLanguage(option.value)"
        >
          <div class="option-icon">
            <zhIcon v-if="option.value === 'zh_CN'" />
            <enIcon v-if="option.value === 'en_US'" />
            <jpIcon v-if="option.value === 'ja_JP'" />
          </div>
          <span class="option-label">{{ option.label }}</span>
          <div v-if="currentLocale === option.value" class="option-check">✓</div>
        </div>
      </div>
    </div>
    <!-- 点击外部关闭下拉菜单的遮罩 -->
    <div v-if="showDropdown" class="dropdown-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { useGlobalStore, useConfigStore } from '@/store';
import zhIcon from '@/assets/images/zh.svg?component';
import enIcon from '@/assets/images/en.svg?component';
import jpIcon from '@/assets/images/jp.svg?component';
import langIcon from '@/assets/images/lang.svg?component';

const configStore = useConfigStore();
const { disableConfig } = storeToRefs(configStore);
const globalStore = useGlobalStore();
const { locale } = useI18n();
const { configList, configNames, isNoConfigRename } = storeToRefs(globalStore);
// 当前选中的语言
const currentLocale = ref('');
// 下拉菜单显示状态
const showDropdown = ref(false);

// 语言选项
const languageOptions = [
  { label: '中文', value: 'zh_CN' },
  { label: 'English', value: 'en_US' },
  { label: '日本語', value: 'ja_JP' },
];

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  if (disableConfig.value) return;
  showDropdown.value = !showDropdown.value;
};

// 关闭下拉菜单
const closeDropdown = () => {
  showDropdown.value = false;
};

// 选择语言
const selectLanguage = (value: string) => {
  handleLanguageChange(value);
  closeDropdown();
};

// 处理语言切换
const handleLanguageChange = async (value: string) => {
  try {
    locale.value = value;
    currentLocale.value = value;

    // 保存到本地存储
    localStorage.setItem('tdesign-starter-locale', value);

    // 显示切换成功提示
    MessagePlugin.success({
      content: t(`messages.multiLangSwitch${value}`),
      duration: 2000,
    });
    const promises = [];
    let allNamesEmpty = true;
    for (let i = 0; i < configList.value.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const name = await globalStore.getConfigName(i);
      if (name) {
        allNamesEmpty = false;
      }
      promises.push(name || t('messages.configDefault') + (i + 1));
    }
    const names = await Promise.all(promises);
    isNoConfigRename.value = allNamesEmpty;
    configNames.value = names;
  } catch (error) {
    console.error('语言切换失败:', error);
    MessagePlugin.error({
      content: t('messages.multiLangSwitchFail'),
      duration: 2000,
    });
  }
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.multi-language-container')) {
    closeDropdown();
  }
};

// 初始化当前语言
onMounted(() => {
  // 从本地存储或i18n实例获取当前语言
  const savedLocale = localStorage.getItem('tdesign-starter-locale') || locale.value;
  currentLocale.value = savedLocale;
  // 添加全局点击事件监听
  document.addEventListener('click', handleClickOutside);
});

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="less">
.multi-language-container {
  position: relative;
  display: inline-block;
}

.language-selector {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    &:hover {
      background-color: transparent;
    }
  }
}

.language-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  .global-icon {
    width: 30px;
    height: 30px;
    color: #ddeaf2;
    svg {
      width: 100%;
      height: 100%;
    }
  }
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  min-width: 140px;
  z-index: 1000;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.language-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ddeaf2;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.active {
    background-color: rgba(64, 158, 255, 0.2);
    color: #409eff;
  }
}

.option-icon {
  display: flex;
  align-items: center;
  margin-right: 12px;
  svg {
    width: 18px;
    height: 18px;
  }
}

.option-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.option-check {
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}
</style>
