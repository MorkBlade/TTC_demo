import { useGlobalStore } from '@/store';
import { t } from '@/locales';

export async function useConfigNamesHook() {
  const globalStore = useGlobalStore();
  const { configList, configNames, isNoConfigRename } = storeToRefs(globalStore);
  await globalStore.getConfigList();
  await globalStore.getCurrentConfig();
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
  return { configNames };
}
