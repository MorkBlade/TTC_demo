import { useGlobalStore } from '@/store';

// 判断是单灯位 还是双灯位 以及判断当前 开关灯的状态
export function useLightingLampHook() {
  // 引入全局状态和灯光状态
  const globalStore = useGlobalStore();

  // 当前区域是否是255
  const isDoubleLighting = computed(() => {
    return globalStore.isDoubleLighting ? 'DoubleLighting' : 'SingleLighting';
  });

  // 通过DoubleLigting 计算openState
  return { isDoubleLighting };
}
