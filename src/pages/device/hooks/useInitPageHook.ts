import { LoadingPlugin } from 'tdesign-vue-next';
import {
  useDeviceStore,
  useGlobalStore,
  useKeyboardStore,
  useMacroStore,
  usePerformanceStore,
  useLightingStore,
  useDisplayerStore,
} from '@/store';
import { t } from '@/locales';
// TODO:加一个调用数据的全局loading

export async function useInitPageHook(params?: { noConfig?: boolean }) {
  const loading = LoadingPlugin({
    text: t('messages.loadingData'),
    loading: false,
  });
  const macroStore = useMacroStore();
  const deviceStore = useDeviceStore();
  const globalStore = useGlobalStore();
  const keyboardStore = useKeyboardStore();
  const displayerStore = useDisplayerStore();
  // const ConfigStore = useConfigStore();
  // const highLevelKeyStore = useHigherKeyStore();
  const performanceStore = usePerformanceStore();
  const lightingStore = useLightingStore();
  // const { activeMenu } = storeToRefs(ConfigStore);
  const { configList, configNames, isNoConfigRename, isDoubleLighting } = storeToRefs(globalStore);
  // 获取系统信息
  await deviceStore.getProtocolVersion();
  await deviceStore.getDeviceInfo();
  await globalStore.getSystem();
  await globalStore.getRtPrecision();
  if (deviceStore.info?.runModeVersion !== 255) {
    // 获取键盘数据
    keyboardStore.checkFnLayer(0);
    await keyboardStore.getKeyLayoutStyle();
    const keyboards = await keyboardStore.getKeyLayout({ layer: keyboardStore.fnLayer });
    // console.log('regain keyboards data:', keyboards);
    // 获取性能数据
    await performanceStore.getPerformance(keyboards.flat());
    // 获取高级键
    // await highLevelKeyStore.getHighLevelKeys(keyboards);
    // 获取宏数据
    // if (activeMenu.value === 'macro') {
    await macroStore.getMacroAllData();
    // }

    // if (activeMenu.value === 'lighting') {
    // 灯光
    await globalStore.getLightingArea();
    await globalStore.getDoubleLighting();
    await globalStore.getSpecialLighting();
    // 获取是不是双灯位的
    const lampData = isDoubleLighting.value ? 'DoubleLighting' : 'SingleLighting';
    lightingStore.lamp = lampData;
    await lightingStore.getLightingBase(lampData);
    await lightingStore.getLightingPalette();
    await lightingStore.getLightingColorCorrection();
    // }
  }
  // 获取屏幕信息
  displayerStore.getDisplayerInfo();
  // 获取系统休眠时间
  await globalStore.getLightingSleepTime();

  if (!params?.noConfig) {
    await globalStore.getConfigList();
    await globalStore.getCurrentConfig();
  }
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
  keyboardStore.activeKeys = [];
  if (performanceStore.axisList.length === 0) {
    try {
      await performanceStore.getAxisList();
      console.log('performanceStore.axisList', performanceStore.axisList);
    } catch (error) {
      console.error('错误:', error.response || error);
    }
  }
  loading.hide();
  return { configNames: configNames.value };
}
