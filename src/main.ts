import { createApp } from 'vue';

import TDesign, { DialogPlugin } from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

import { registerSW } from 'virtual:pwa-register';
import px2rem from '@/directives/px2rem';
import px2vw from '@/directives/px2vw';
import { useAdaptiveRem } from './utils/rem';
// import '../registerServiceWorker';
// import './service-worker';

import App from './App.vue';
import router from './router';
import { store } from './store';
import { i18n } from './locales';
import '@/style/index.less';

useAdaptiveRem(); // 监听窗口尺寸 + 缩放自动调整

const app = createApp(App);
// console.log('import.meta.env.PROD', import.meta.env.PROD);
// if ('serviceWorker' in navigator && import.meta.env.PROD) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js');
//   });
// }

app.use(TDesign);
app.use(store);
app.use(router);
app.use(px2rem);
app.use(px2vw);
app.use(i18n);

app.mount('#app');

const updateSW = registerSW({
  async onNeedRefresh() {
    const dialog = DialogPlugin.confirm({
      header: '新版本已发布',
      body: '检测到新版本，是否立即刷新？',
      onConfirm: () => {
        updateSW(true);
        setTimeout(() => {
          window.location.reload();
        }, 500); // 延迟刷新，确保缓存切换完成
        dialog.destroy();
      },
      onClose: () => {
        dialog.destroy();
      },
    });
  },
  onOfflineReady() {
    console.log('应用已准备好离线使用。');
  },
});
