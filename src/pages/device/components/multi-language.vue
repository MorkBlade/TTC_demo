<template>
  <div class="multi-language-container">
    <t-select
      v-model="currentLocale"
      :disabled="disableConfig"
      :options="languageOptions"
      :placeholder="t('messages.multiLangSelect')"
      class="language-select"
      @change="handleLanguageChange"
    >
      <template #prefixIcon>
        <zhIcon v-if="currentLocale === 'zh_CN'" />
        <enIcon v-if="currentLocale === 'en_US'" />
        <jpIcon v-if="currentLocale === 'ja_JP'" />
      </template>
    </t-select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { useGlobalStore, useConfigStore } from '@/store';
import zhIcon from '@/assets/images/zh.svg?component';
import enIcon from '@/assets/images/en.svg?component';
import jpIcon from '@/assets/images/jp.svg?component';

const configStore = useConfigStore();
const { disableConfig } = storeToRefs(configStore);
const globalStore = useGlobalStore();
const { locale } = useI18n();
const { configList, configNames, isNoConfigRename } = storeToRefs(globalStore);
// 当前选中的语言
const currentLocale = ref('');

// 语言选项
const languageOptions = [
  { label: '中文', value: 'zh_CN' },
  { label: 'English', value: 'en_US' },
  { label: '日本語', value: 'ja_JP' },
];

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

// 初始化当前语言
onMounted(() => {
  // 从本地存储或i18n实例获取当前语言
  const savedLocale = localStorage.getItem('tdesign-starter-locale') || locale.value;
  currentLocale.value = savedLocale;
});
</script>

<style scoped lang="less">
:deep(.t-select) {
  padding-right: 10px;
  & .t-input {
    background-color: transparent;
    border: none;
    padding: 0;

    &__prefix {
      margin-left: -2px;
      margin-right: 0;
    }
    &--focused {
      box-shadow: none;
    }
    &__inner {
      color: #ddeaf2;
    }
  }

  & .t-fake-arrow {
    color: #ddeaf2;
  }
  & .t-fake-arrow--active {
    color: #ddeaf2;
  }
}

:deep(.t-select__list) {
  background-color: transparent;
}
svg {
  transform: scale(0.6);
}
</style>
