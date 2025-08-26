import { storeToRefs } from 'pinia';
import { useLightingStore, useGlobalStore } from '@/store';

export function useDoubleLightingHook() {
  const lightingStore = useLightingStore();
  const globalStore = useGlobalStore();
  const { lightingLinkState } = storeToRefs(globalStore);
  const { upOpen, downOpen } = storeToRefs(lightingStore);

  // 双灯位开关
  const handleDoubleLight = async (flag: number) => {
    /*
      downLightingSwitch 和 upLightingSwitch 都为false， 则open = false；
      downLightingSwitch 和 upLightingSwitch 有一个是true， 则open = true；
      downLightingSwitch=false； upLightingSwitch=true， 传参为1 'OpenUp'
      downLightingSwitch=true； upLightingSwitch=false， 传参为2 'OpenDown'
      downLightingSwitch=true； upLightingSwitch=true， 传参为3 'Open'
    */
    let keyCode: 'Open' | 'Close' | 'OpenUp' | 'OpenDown' = 'Open';
    console.log('upOpen', upOpen.value, 'downOpen', downOpen.value);
    if (flag) {
      if (lightingLinkState.value) {
        downOpen.value = upOpen.value;
      }
    } else if (lightingLinkState.value) {
      upOpen.value = downOpen.value;
    }

    if (!downOpen.value && !upOpen.value) {
      lightingStore.updateSwitch(false);
      keyCode = 'Close';
    } else if (downOpen.value && upOpen.value) {
      keyCode = 'Open';
      lightingStore.updateSwitch(true);
    } else if (!downOpen.value || upOpen.value) {
      keyCode = 'OpenUp';
      lightingStore.updateSwitch(true);
    } else if (downOpen.value || !upOpen.value) {
      keyCode = 'OpenDown';
      lightingStore.updateSwitch(true);
    }

    await lightingStore.setLightingBase(keyCode, 'DoubleLighting');
  };

  const onLink = () => {
    lightingLinkState.value = !lightingLinkState.value;
  };

  return {
    lightingLinkState,
    upOpen,
    downOpen,
    handleDoubleLight,
    onLink,
  };
}
