import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
// import { useDeviceStore } from '@/store/index';
import createRouteGuard from './guard';

// 自动导入modules文件夹下所有ts文件
const modules = import.meta.glob('./modules/**/*.ts');

// 路由暂存
const routeModuleList: Array<RouteRecordRaw> = [];

Object.keys(modules).forEach((key) => {
  const mod = modules[key]();
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

// 存放动态路由
export const asyncRouterList: Array<RouteRecordRaw> = [...routeModuleList];

// 存放固定的路由
const defaultRouterList: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: { name: 'connect' },
  },
  {
    path: '/connect',
    name: 'connect',
    component: () => import('@/pages/connect/index.vue'),
  },
  {
    path: '/device',
    name: 'device',
    component: () => import('@/pages/device/index.vue'),
  },
  {
    path: '/:w+',
    name: '404Page',
    redirect: '/result/404',
  },
];

export const allRoutes = [...defaultRouterList, ...asyncRouterList];

const router = createRouter({
  history: createWebHistory(),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

createRouteGuard(router);

// router.beforeEach(async (to, from, next) => {
//   if (to.path === '/connect') {
//     next();
//     return;
//   }
//   const deviceStore = useDeviceStore();
//   try {
//     const result = await deviceStore.connectDevice();
//     if (result) {
//       next();
//     } else {
//       next({ path: '/connect' });
//     }
//   } catch (error) {
//     console.error('设备连接失败:', error);
//     // next('/connect');
//   }
// });

export default router;
