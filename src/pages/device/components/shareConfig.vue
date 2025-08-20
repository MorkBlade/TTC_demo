<template>
  <div class="">
    <!-- <div class="share-config__title">配置分享</div> -->
    <div class="share-config__btn-group">
      <t-upload
        v-model="fileList"
        :auto-upload="false"
        :allow-upload-duplicate-file="false"
        action="https://service-bv448zsw-1257786608.gz.apigw.tencentcs.com/api/upload-demo"
        accept=".json"
        :show-upload-list="false"
        @change="handleImport"
      >
        <t-button class="share-config__btn">{{ t('messages.shareImport') }}</t-button>
      </t-upload>
      <t-button class="share-config__btn" variant="outline" @click="handleExport">{{
        t('messages.shareExport')
      }}</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
// import { httpService } from '@/http/api/index.js';

import services from '@/services/index';
import { useKeyboardStore } from '@/store/modules/keyboard';
import { useMacroStore } from '@/store/modules/macro';
import { useGlobalStore } from '@/store/modules/globalSetting';
import { useDeviceStore } from '@/store/modules/device';
import { useInitPageHook } from '@/pages/device/hooks/useInitPageHook';

const keyboardStore = useKeyboardStore();
const macroStore = useMacroStore();
const globalStore = useGlobalStore();
const deviceStore = useDeviceStore();

const fileList = ref([]);

const handleExport = async () => {
  // 导出配置逻辑，后续可补充
  // 例如：生成 JSON 并下载
  const { keyboardLayout } = keyboardStore;
  // 获取高级键
  // await highLevelKeyStore.getHighLevelKeys(keyboards);
  // 获取宏数据
  // if (activeMenu.value === 'macro') {
  const { lightingAreaTotal, isDoubleLighting, lightingArea } = globalStore;
  await macroStore.getMacroAllData();
  const lamp = isDoubleLighting ? 'DoubleLighting' : 'SingleLighting';
  const lightData: Record<string, any> = {};
  const customLight = await services.getLightingCustom();
  if (globalStore.system) {
    await globalStore.setSystem(globalStore.system === 'MAC' ? 'WIN' : 'MAC');
    await services.setSystemType(globalStore.system === 'MAC' ? 'MAC' : 'WIN');
  }

  // 键盘区域
  const keyboardRes = await services.getLightingBase({ area: 'Keyboard', config: 'Base' }, lamp);
  lightData.Keyboard = {
    light: keyboardRes,
    area: 'Keyboard',
    lamp,
    customLight,
  };
  if (lightingAreaTotal > 1) {
    // 多区域：键盘 + 装饰区域
    // lightData.light = light;

    // 动态处理装饰区域
    const decorateAreas = ['Decorate1', 'Decorate2', 'Decorate3', 'Decorate4', 'Decorate5'] as const;
    const areaCount = Math.min(lightingAreaTotal - 1, decorateAreas.length);

    if (areaCount > 0) {
      const areaPromises = decorateAreas.slice(0, areaCount).map(async (areaName, index) => {
        const areaRes = await services.getLightingBase({ area: areaName, config: 'Base' }, 'SingleLighting');
        const customLight = await services.getDecorate1Custom({
          rows: lightingArea[index + 1].rows,
          cols: lightingArea[index + 1].cols,
          area: areaName,
        });
        return { areaName, areaRes, customLight };
      });

      const areaResults = await Promise.all(areaPromises);

      areaResults.forEach(({ areaName, areaRes, customLight }) => {
        lightData[areaName] = {
          light: areaRes,
          area: areaName,
          lamp: 'SingleLighting',
          customLight,
        };
      });
    }
  }

  const data = {
    keyboards: keyboardLayout,
    macro: { v2list: macroStore.macroData },
    v2light: lightData,
    system: {
      rateOfReturn: 0,
      topDeadBandSwitch: 0,
      pid: deviceStore.device.productId,
      vid: deviceStore.device.vendorId,
      keyboardName: deviceStore.device.productName,
      usage: deviceStore.device.usage,
      usagePage: deviceStore.device.usagePage,
      currentKeyboardSystem: globalStore.system,
    },
    version: 'v2',
    firmwareVersion: deviceStore.info.appVersion,
    protocolVersion: deviceStore.version,
    sn: deviceStore.info.sn,
  };
  console.log('data', data);
  // httpService.exportConfiguration({
  //   config_name: globalStore.configNames[globalStore.configList.indexOf(globalStore.currentConfig)] || '配置分享',
  //   keyboard_name: deviceStore.device.productName,
  //   version: 'v2',
  //   system: globalStore.system,
  //   config: data,
  //   vid: deviceStore.device.vendorId,
  //   pid: deviceStore.device.productId,
  // });
  services.exportConfiguration(data);
};

const handleImport = async (_unused: any) => {
  // 导入配置逻辑，后续可补充
  // 例如：读取 JSON 文件内容
  const { keyboardLayout } = keyboardStore;
  if (fileList.value.length > 0) {
    const loadingId = MessagePlugin.loading(t('messages.shareImporting'));
    try {
      const file = fileList.value[0].raw;
      const data = await services.importConfiguration(file, keyboardLayout.flat() as any, {
        pid: deviceStore.device.productId,
        vid: deviceStore.device.vendorId,
      });

      useInitPageHook({ noConfig: true });
      console.log('data: ', data);
    } catch (error) {
      console.log('error: ', error);
      MessagePlugin.error(t('messages.shareImportFail') + (error.message || ''));
    } finally {
      fileList.value = [];
      MessagePlugin.close(loadingId);
    }
  }
};
</script>

<style lang="less" scoped>
.share-config {
  border-radius: 16px;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.04) 60%, rgba(80, 120, 255, 0.06) 100%);

  &__title {
    color: #fff;
    font-size: 18px;
    margin-bottom: 16px;
  }

  &__btn-group {
    display: flex;
    gap: 16px;
  }

  &__btn {
    padding: 6px 18px;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.08) 60%, rgba(80, 120, 255, 0.1) 100%);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
    min-width: 72px;
    min-height: 32px;

    &:hover {
      border-color: #4a8eff;
      background: linear-gradient(120deg, rgba(80, 120, 255, 0.13) 60%, rgba(255, 255, 255, 0.1) 100%);
    }
  }
}

:deep(.t-upload__flow) {
  display: none !important;
}
:deep(.t-upload__dragger) {
  display: none !important;
}
:deep(.t-upload__card) {
  display: none !important;
}
:deep(.t-upload__single-display-text) {
  display: none !important;
}
</style>
