import { useKeyboardStore, usePerformanceStore } from '@/store';
import emitter from '@/utils/app-emitter';
import { t } from '@/locales';
import type { PerformanceData, KeyboardItemInfo, CalibrationStatus, MenuClickData, AxisValue } from '@/types/keyboard';

export function usePerformanceHook(rowIndex, colIndex, currentPageName: Ref<string>) {
  const keyboardStore = useKeyboardStore();
  const performanceStore = usePerformanceStore();
  const { performanceTab, isAxisStatus } = storeToRefs(performanceStore);
  const advancedEnabled = ref<boolean>(false);

  emitter.on('menu-click', (data: MenuClickData) => {
    // if (data.value !== 'performance') {
    //   if (performanceTab.value !== 0) {
    //     performanceTab.value = 0;
    //     // performanceStore.performanceTab = 0;
    //   }
    // }
    if (data.value !== 'highLevelKey') {
      if (advancedEnabled.value) advancedEnabled.value = false;
    }
  });

  // emitter.on('performance-tab', ({ value }: MenuClickData) => {
  //   performanceTab.value = value as number;
  // });

  const keyboardData = computed<KeyboardItemInfo[][]>(() => keyboardStore.keyboardLayout);

  const performanceData = computed<PerformanceData | null>(() => {
    if (keyboardData.value[rowIndex]?.[colIndex]) {
      return keyboardData.value[rowIndex][colIndex].performance;
    }
    return null;
  });

  const calibrationData = computed<number | null>(() => {
    if (performanceData.value?.calibrations) {
      return performanceData.value.calibrations;
    }
    return null;
  });

  const calibrationStatus = computed<CalibrationStatus>(() => {
    if (performanceData.value?.calibrate === 0) return { color: 'red', text: t('messages.uncalibrated') };
    if (performanceData.value?.calibrate === 1) return { color: '#699ef5', text: t('messages.calibrated') };
    if (performanceData.value?.calibrate === 2) return { color: 'green', text: t('messages.newCalibration') };
    return { color: '', text: '' };
  });

  const singleTravel = computed<number | null>(() => {
    if (performanceTab.value === 0) {
      return performanceData.value?.normalPress ?? null;
    }
    return null;
  });

  const isRTMode = computed<boolean>(() => {
    return performanceData.value?.mode === 1;
  });

  const rtFirstTouchTravel = computed<number | null>(() => {
    if (performanceTab.value === 0) {
      return performanceData.value?.rtFirstTouch ?? null;
    }
    return null;
  });

  const rtPressTravel = computed<number | null>(() => {
    if (performanceTab.value === 0) {
      return performanceData.value?.rtPress ?? null;
    }
    return null;
  });

  const rtReleaseTravel = computed<number | null>(() => {
    if (performanceTab.value === 0) {
      return performanceData.value?.rtRelease ?? null;
    }
    return null;
  });

  const pressDeadTravel = computed<number | null>(() => {
    if (performanceTab.value === 2) {
      return performanceData.value?.pressDeadStroke ?? null;
    }
    return null;
  });

  const releaseDead = computed<number | null>(() => {
    if (performanceTab.value === 2) {
      return performanceData.value?.releaseDeadStroke ?? null;
    }
    return null;
  });

  const axisObj = computed(() => {
    const { axisList } = performanceStore;

    return axisList.reduce((acc, item) => {
      const id = item.aixsDetail[0].axis_id;
      acc[id] = item;
      return acc;
    }, {});
  });

  const axisVal = computed(() => {
    if (performanceTab.value === 3) {
      const { axis, axisV2Id } = performanceData.value;
      const { axisList } = performanceStore;
      if (isAxisStatus.value === 'v1') {
        const currentAxis = axisList[axis];
        if (currentAxis) {
          return {
            axis_name: currentAxis.axis_name,
            axis_color: currentAxis.axis_color || '#fff',
            doctrine_range_right: Number(currentAxis.doctrine_range_right),
            doctrine_range_left: Number(currentAxis.doctrine_range_left),
          } as AxisValue;
        }
      }
      if (isAxisStatus.value === 'v2') {
        const currentAxis = axisObj.value[axisV2Id];
        if (currentAxis) {
          return {
            axis_name: currentAxis.axis_name,
            axis_color: currentAxis.axis_color || '#fff',
          } as AxisValue;
        }
      }
    }
    return null;
  });

  const advancedTag = computed<string | null>(() => {
    let type = null;
    if (['highLevelKey', 'customKey', 'macro'].includes(currentPageName.value)) {
      const mode = Number(keyboardData.value[rowIndex][colIndex].advancedKeys.advancedType);
      if (mode === 1) {
        type = 'DKS';
      } else if (mode === 2) {
        type = 'MPT';
      } else if (mode === 3) {
        type = 'MT';
      } else if (mode === 4) {
        type = 'TGL';
      } else if (mode === 5) {
        type = 'END';
      } else if (mode === 6) {
        type = 'SOCD';
      } else if (mode === 7) {
        type = 'RS';
      }
    }
    return type;
  });

  return {
    performance,
    calibrationData,
    calibrationStatus,
    singleTravel,
    isRTMode,
    rtFirstTouchTravel,
    rtPressTravel,
    rtReleaseTravel,
    pressDeadTravel,
    releaseDead,
    axisVal,
    advancedEnabled,
    performanceTab,
    advancedTag,
  };
}
