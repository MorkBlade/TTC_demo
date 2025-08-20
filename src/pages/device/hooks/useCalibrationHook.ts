import { computed, ref } from 'vue';
import { useKeyboardStore } from '@/store';

export function useCalibrationHook() {
  const keyboardStore = useKeyboardStore();

  const isCalibration = computed(() => {
    const { keyboardLayout } = keyboardStore;
    const isCalibration = ref(false);
    keyboardLayout.forEach((row) => {
      row.forEach((col) => {
        const { performance, keyValue } = col;
        if (performance.calibrate === 0 && keyValue !== 0) isCalibration.value = true;
      });
    });
    return isCalibration.value;
  });
  return { isCalibration };
}
