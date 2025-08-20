<template>
  <div class="device-custom-key">
    <div class="device-custom-key-head" @click="onChangeTab">
      <div class="device-custom-key-title" :data-id="0" :class="{ 'is-active': checkedTab === 0 }">
        {{ t('messages.customKeyTabBasic') }}
      </div>
      <div class="device-custom-key-title" :data-id="3" :class="{ 'is-active': checkedTab === 3 }">
        {{ t('messages.customKeyTabSpecial') }}
      </div>
      <div class="device-custom-key-title" :data-id="1" :class="{ 'is-active': checkedTab === 1 }">
        {{ t('messages.customKeyTabMedia') }}
      </div>
      <div class="device-custom-key-title" :data-id="2" :class="{ 'is-active': checkedTab === 2 }">
        {{ t('messages.customKeyTabLight') }}
      </div>
      <div class="device-custom-key-title" :data-id="4" :class="{ 'is-active': checkedTab === 4 }">
        {{ t('messages.customKeyTabControl') }}
      </div>
      <!-- <div class="device-custom-key-title" :data-id="6" :class="{ 'is-active': checkedTab === 6 }">
        {{ t('messages.customKeyTabTriMode') }}
      </div> -->
      <div
        v-if="isCheckVersion7"
        class="device-custom-key-title"
        :data-id="5"
        :class="{ 'is-active': checkedTab === 5 }"
      >
        {{ t('messages.customKeyTabMouse') }}
      </div>
      <!-- <div class="device-custom-key-title" :data-id="4" :class="{ 'is-active': checkedTab === 4 }">宏</div> -->
    </div>
    <div class="device-custom-key__body">
      <div v-if="checkedTab === 0" class="device-custom-key__body-global">
        <div class="sec-section">
          <key
            v-for="item in KEYBOARD_GLOBAL[1].keys"
            :key="item"
            is-global
            :is-position-key="item === 0"
            :active="selectKey === item"
            :key-value="item"
          ></key>
        </div>
        <div class="thir-section">
          <key
            v-for="item in KEYBOARD_GLOBAL[2].keys"
            :key="item"
            is-global
            :is-position-key="item === 0"
            :active="selectKey === item"
            :key-value="item"
          ></key>
        </div>
        <div class="four-section">
          <key
            v-for="item in KEYBOARD_GLOBAL[3].keys"
            :key="item"
            is-global
            :active="selectKey === item"
            :is-position-key="item === 0"
            :key-value="item"
          ></key>
        </div>
        <div class="fifth-section">
          <key
            v-for="item in KEYBOARD_GLOBAL[4].keys"
            :key="item"
            is-global
            :is-position-key="item === 0"
            :active="selectKey === item"
            :key-value="item"
          >
          </key>
        </div>
      </div>
      <div v-if="checkedTab === 1" class="device-custom-key__body-multimedia">
        <key
          v-for="item in keyboardMapByType.media"
          :key="item"
          style="margin-right: 5px"
          :active="selectKey === item"
          :key-value="item"
        ></key>
      </div>
      <div v-if="checkedTab === 2" class="device-custom-key__body-light">
        <key
          v-for="item in lights"
          :key="item"
          style="margin-right: 5px"
          :active="selectKey === item"
          :key-value="item"
        ></key>
      </div>
      <div v-if="checkedTab === 3" class="device-custom-key__body-light">
        <key
          v-for="item in keyboardMapByType.special"
          :key="item"
          style="margin-right: 5px"
          :iszw="item === 0"
          :active="selectKey === item"
          :key-value="item"
        ></key>
      </div>
      <div v-if="checkedTab === 4" class="device-custom-key__body-light">
        <key
          v-for="item in keyboardMapByType.control"
          :key="item"
          style="margin-right: 5px"
          :active="selectKey === item"
          :key-value="item"
        ></key>
      </div>
      <div v-if="checkedTab === 5" class="device-custom-key__body-light">
        <key
          v-for="item in keyboardMapByType.mouse"
          :key="item"
          style="margin-right: 5px"
          :active="selectKey === item"
          :key-value="item"
        ></key>
      </div>
      <div v-if="checkedTab === 6" class="device-custom-key__body-light">
        <key
          v-for="item in keyboardMapByType.triMode"
          :key="item"
          style="margin-right: 5px"
          :active="selectKey === item"
          :key-value="item"
        ></key>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'DeviceConfigCustomKey' });
import { KEYBOARD_GLOBAL } from '@/config/constant';
import { useVersionHooks } from '@/hooks/version/useVersionHooks';
import { keyboardMapByType } from '@/config/byte-to-key/keyboard-map';

import { useKeyboardStore, useGlobalStore } from '@/store';

import Key from '@/components/key/index.vue';
import { t } from '@/locales';

const formData = reactive({ type: 'win', fn: 0 });
const { isCheckVersion: isCheckVersion7 } = useVersionHooks('1.0.7.0');
const keyboardStore = useKeyboardStore();
const globalStore = useGlobalStore();
const { lightingArea } = storeToRefs(globalStore);

const selectKey = computed(() => keyboardStore.selectKey);

const userAgent = navigator.userAgent.toLowerCase();
const isWindows = userAgent.includes('windows');
const isMac = userAgent.includes('macintosh');

if (isWindows) formData.type = 'win';
if (isMac) formData.type = 'mac';

// const handleSystemTypeChange = (e) => {
//   // Todo: 切换系统 暂时没有调用接口
//   console.log('handleSystemTypeChange', e);
// };

// const handleFnChange = () => {
//   const { fn } = formData;
//   keyboardStore.getLayoutKeyInfo(fn);
// };

onMounted(async () => {
  formData.fn = keyboardStore.fnLayer;
});

const checkedTab = ref(0);

const onChangeTab = (e) => {
  if (e.target.getAttribute('data-id') === null) return;
  checkedTab.value = Number(e.target.getAttribute('data-id'));
};

// lightingArea 装饰灯的问题 当没有装饰灯的时候就不要显示和装饰相关的参数
const lights = computed(() => {
  // lightingArea的数组只有一个对象的时候那就是只有主键区域
  const lightingAreas = lightingArea.value.length;
  // TODO:灯光逻辑:lightingAreas为1的时候默认只有主键区的灯，2的时候有一个装饰灯、3的时候有两个装饰灯依次类推下去。
  // TODO:灯光数组未来考虑使用过滤去做，后面要整理一份 通用的给到罗工他们进行维护
  // 装饰灯的数组
  // const decorativeLighting1 = [62224, 62225, 62226, 62227, 62228, 62229, 62230, 62231, 62232];
  // const decorativeLighting2 = [62240, 62241, 62242, 62243, 62244, 62245, 62246, 62247, 62248];
  // const decorativeLighting3 = [62256, 62257, 62258, 62259, 62260, 62261, 62262, 62263, 62264];
  const data = keyboardMapByType.light;
  if (lightingAreas === 1) {
    const result = data.filter((item) => !keyboardMapByType.decorativeLighting1.includes(item));
    return result;
  }
  if (lightingAreas === 2) {
    return [...data];
  }
  if (lightingAreas === 3) {
    return [...data, ...keyboardMapByType.decorativeLighting2];
  }
  if (lightingAreas === 4) {
    return [...data, ...keyboardMapByType.decorativeLighting2, ...keyboardMapByType.decorativeLighting3];
  }
  return data;
});
</script>

<style scoped lang="less">
@import './index.less';
</style>
