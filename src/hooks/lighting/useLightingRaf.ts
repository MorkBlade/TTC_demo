import { ref, onBeforeUnmount } from 'vue';

export function useLightingRaf(callback: (timestamp: number) => Promise<void>) {
  const timer = ref<number | null>(null);

  const start = () => {
    if (timer.value) return;
    const loop = async (timestamp: number) => {
      await callback(timestamp);
      timer.value = requestAnimationFrame(loop);
    };
    timer.value = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (timer.value) {
      cancelAnimationFrame(timer.value);
      timer.value = null;
    }
  };

  onBeforeUnmount(stop);

  return { start, stop, timer };
}
