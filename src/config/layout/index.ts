/// <reference types="vite/client" />

declare module 'vite' {
  interface ImportMeta {
    globEager: (path: string) => Record<string, { default: any }>;
  }
}

const files = import.meta.glob<{ default: any }>('./modules/*.json', { eager: true });

const modules = {};

const keys = Object.keys(files);
keys.forEach((key) => {
  const fileName = key.replace(/^\.\/modules\/(.*)\.\w+$/, '$1');
  modules[fileName] = files[key].default;
});

export default modules;
