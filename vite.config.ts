import { ConfigEnv, UserConfig, loadEnv } from 'vite';
import { viteMockServe } from 'vite-plugin-mock'; // 插件 提供 mock 接口功能
import createVuePlugin from '@vitejs/plugin-vue'; // 插件 支持 Vue 单文件组件 (.vue)，让 Vite 能够识别并正确处理 .vue 文件中的 <template>, <script>, 和 <style> 标，支持热更新
import vueJsx from '@vitejs/plugin-vue-jsx'; // 插件 支持 Vue 中使用 JSX/TSX
import svgLoader from 'vite-svg-loader'; // 插件 将 SVG 文件作为 Vue 组件引入
import AutoImport from 'unplugin-auto-import/vite'; // 插件 自动导入API和工具函数(自动导入Vue Composition API、vue-router、pinia/vuex、自定义工具函数，无需手动import)
import Components from 'unplugin-vue-components/vite'; // 插件 自动注册 Vue 组件(使用到某个组件会自动识别并注册，一般用于第三方ui库、src/components下组件)
import { TDesignResolver } from 'unplugin-vue-components/resolvers'; // TDesign 按需导入
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

const CWD = process.cwd(); // 获取当前工作目录

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, CWD);
  // 合并到process.env，兼容旧用法
  process.env = { ...process.env, ...env };
  const { VITE_BASE_URL, VITE_DEV } = env; // 用env而不是直接loadEnv返回的对象
  const isDev = VITE_DEV === 'dev';
  return {
    base: VITE_BASE_URL,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            // 导入变量覆盖默认样式
            hack: `true; @import (reference) "${path.resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
      postcss: './postcss.config.js',
    },

    plugins: [
      // Vue 单文件组件支持
      createVuePlugin({
        script: {
          defineModel: true,
          propsDestructure: true,
        },
      }),
      // Vue JSX 支持
      vueJsx(),
      // 自动导入常用 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', { pinia: ['storeToRefs'] }],
        ignore: ['h'], // 忽略
        eslintrc: { enabled: true },
        resolvers: [],
      }),
      // 自动识别注册
      Components({
        resolvers: [TDesignResolver({ library: 'vue-next' })], // 第三方ui库
        dirs: ['src/components'], // 本地自定义组件
      }),
      viteMockServe({
        mockPath: 'mock',
        localEnabled: true,
      }),
      svgLoader(),
      env.VITE_GLOB_APP_PWA === 'true' &&
        VitePWA({
          // strategies: 'generateSW',
          includeAssets: ['favicon.ico'],
          registerType: 'prompt',
          manifest: {
            name: 'Sparklink',
            short_name: 'Sparklink',
            icons: [
              { src: '/logo-192.png', sizes: '192x192', type: 'image/png' },
              { src: '/logo-512.png', sizes: '512x512', type: 'image/png' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'], // 可自定义缓存类型
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/img\.js\.design\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'img-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/v2\.xsyd\.top\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'xsyd-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/api\.sparklinkplayjoy\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'sparklinkplayjoy-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          },
        }),
    ],
    build: {
      sourcemap: isDev,
      target: 'es2015',
      minify: 'esbuild',
      rollupOptions: {
        input: {
          main: 'index.html',
        },
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks: {
            'vue-core': ['vue'],
            'vue-router': ['vue-router'],
            'vue-i18n': ['vue-i18n'],
            pinia: ['pinia'],
            tdesign: ['tdesign-vue-next', 'tdesign-icons-vue-next'],
            echarts: ['echarts'],
            utils: ['axios', 'qs', 'mitt', 'uuid', '@vueuse/core'],
          },
        },
        preserveEntrySignatures: 'strict',
      },
      chunkSizeWarningLimit: 2000,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      port: 3002,
      host: '0.0.0.0',
      open: false,
      proxy: {
        '/api/v1': {
          target: 'https://api.sparklinkplayjoy.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
          secure: false,
        },
        '/storage': {
          target: 'https://api.sparklinkplayjoy.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/storage/, '/storage'),
        },
      },
    },
  };
};
