import { ref, onBeforeUnmount } from 'vue';
import debounce from 'lodash/debounce';

export function useDebouncedAsyncSwitch(asyncFn: (value: any, index: number) => Promise<void>, wait = 300) {
  const isSwitching = ref(false);
  const isUnmounted = ref(false);

  const wrappedFn = async (value: any, index: number) => {
    if (isUnmounted.value) return;
    if (isSwitching.value) return;
    isSwitching.value = true;
    try {
      await asyncFn(value, index);
    } finally {
      isSwitching.value = false;
    }
  };

  const debouncedFn = debounce(wrappedFn, wait);

  onBeforeUnmount(() => {
    debouncedFn.cancel();
    isUnmounted.value = true;
  });

  return { debouncedFn, isUnmounted };
}
