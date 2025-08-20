import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(createPersistedState());

export { store };

export * from './modules/device';
export * from './modules/displayer';
export * from './modules/lighting';
export * from './modules/globalSetting';
export * from './modules/keyboard';
export * from './modules/performance';
export * from './modules/higherKey';
export * from './modules/macro';
export * from './modules/config';

export default store;
