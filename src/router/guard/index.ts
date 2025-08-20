import { useDeviceStore } from '@/store';
import { setRouteEmitter } from '@/utils/router-listener';

function setupPageGuard(router) {
  router.beforeEach(async (to, from, next) => {
    setRouteEmitter(to);
    console.log('router beforeEach log');
    if (to.path === '/connect') {
      next();
      return;
    }
    const deviceStore = useDeviceStore();
    try {
      if (!deviceStore.connectDeviceStatus) {
        const result = await deviceStore.connectDevice();
        if (result) {
          next();
        } else {
          next({ path: '/connect', replace: true });
        }
      } else {
        next();
      }
    } catch (error) {
      console.error('设备连接失败:', error);
      if (to.path !== '/connect') {
        next({ path: '/connect', replace: true });
      } else {
        next();
      }
    }
  });
}

export default function createRouteGuard(router) {
  setupPageGuard(router);
}
