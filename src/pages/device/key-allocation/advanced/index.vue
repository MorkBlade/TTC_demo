<template>
  <div class="tabs-box">
    <div class="tab">
      <div class="tab-list">
        <tabs-l2 :tabMenu="advancedKeyMenu" v-model="tabItem" @change="onChangeTab" />
      </div>
      <div class="btn-box" v-show="isEdit">
        <btn type="primary" class="btn-confirm" @click="handleSaveBIndKeyClick">确定</btn>
        <btn type="primary" class="btn-cancel" @click="handleCancelClick">取消</btn>
      </div>
    </div>
  </div>
  <div class="content">
    <!-- 已激活高级键 -->
    <template v-if="tabItem === 0">
      <actived-key :advancedData="advancedItems" @toAdd="toAdd" @edit="edit" :addMenuItems="addMenuItems" />
    </template>

    <template v-else>
      <!-- 高级键列表 -->
      <advanced-key-list :advancedData="advancedItems" @activeAddNew="activeAddNew" @edit="edit" />
      <!-- 设置区域 -->
      <div class="setting-box">
        <div class="setting-box-text">
          <div class="title">{{ addMenuItems.find((item) => item.value === tabItem)?.title }}</div>
          <div class="desc">{{ addMenuItems.find((item) => item.value === tabItem)?.desc }}</div>
        </div>
        <template v-if="tabItem === 'socd' && isEdit">
          <socd ref="childRef" v-model:socd-info="socdInfo" />
        </template>
        <template v-else-if="tabItem === 'dks' && isEdit">
          <dks ref="childRef" v-model:dks-info="dksInfo" />
        </template>
        <template v-else-if="tabItem === 'mpt' && isEdit">
          <mpt ref="childRef" v-model:mpt-info="mptInfo" />
        </template>
        <template v-else-if="tabItem === 'mt' && isEdit">
          <mt ref="childRef" v-model:mt-info="mtInfo" />
        </template>
        <template v-else-if="tabItem === 'tgl' && isEdit">
          <tgl ref="childRef" v-model:tgl-info="tglInfo" />
        </template>
        <template v-else-if="tabItem === 'end' && isEdit">
          <end ref="childRef" v-model:end-info="endInfo" />
        </template>
      </div>
      <!-- 按键区 -->
      <key-box />
    </template>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AdvancedKeyList from './components/ActivedKeyList.vue';
import TabsL2 from '../components/Tabs-L2.vue';
import ActivedKey from './components/ActivedKey.vue';
import KeyBox from './components/KeyBox.vue';
import Socd from './components/socd/index.vue';
import Dks from './components/dks/index.vue';
import Mpt from './components/mpt/index.vue';
import Mt from './components/mt/index.vue';
import Tgl from './components/tgl/index.vue';
import End from './components/end/index.vue';
import { useHigherKeyStore, useKeyboardStore, useConfigStore } from '@/store';
import emitter from '@/utils/app-emitter';
import useSetAdvanced from './hook/useSetAdvanced';

const configStore = useConfigStore();
const { activeMenu } = storeToRefs(configStore);
const {
  childRef,
  socdInfo,
  dksInfo,
  mtInfo,
  mptInfo,
  tglInfo,
  endInfo,
  rsInfo,
  advancedItems,
  resetDefaultValue,
  handleDialoConfirm,
} = useSetAdvanced();
// const tabItem = ref('socd');
const socdKeycodes = [];
const keyboardStore = useKeyboardStore();
const { deleteHighLevelKey } = useHigherKeyStore();

const { t } = useI18n();
// 编辑状态
const isEdit = ref(false);

const advancedKeyMenu = computed(() => [
  { label: t('messages.activedHighKey'), value: 0 },
  { label: t('messages.highKeyMenuSocd'), value: 'socd' },
  { label: t('messages.highKeyMenuDks'), value: 'dks' },
  // { label: t('messages.highKeyMenuMpt'), value: 'mpt' },
  // { label: t('messages.highKeyMenuMt'), value: 'mt' },
  // { label: t('messages.highKeyMenuTgl'), value: 'tgl' },
  // { label: t('messages.highKeyMenuEnd'), value: 'end' },
]);

const addMenuItems = [
  // {
  //   title: '双效点击(MT)',
  //   desc: '单个按键实现2种功能：单击按键为一种， 长按按键为一种',
  //   value: 'mt',
  // },
  {
    title: '同时触发(SOCD)',
    desc: '绑定两个按键，并根据您的设置决定他们如何触发',
    value: 'socd',
  },

  {
    title: '动态键程(DKS)',
    desc: '单个按键实现四种功能，根据按压程度绑定按键功能',
    value: 'dks',
  },
  // {
  //   title: '多点触发(MPT)',
  //   desc: '单个按键实现绑定的三种功能',
  //   value: 'mpt',
  // },
  // {
  //   title: '切换开关(TGL)',
  //   desc: '单击按键可开关持续触发，按住案件则为正常触发行为',
  //   value: 'tgl',
  // },
  // {
  //   title: '松开触发(END)',
  //   desc: '松开触发是指在松开一个键的同时，触发另一个键的功能',
  //   value: 'end',
  // },
];
const TYPE_MAPPING = {
  1: 'dks',
  2: 'mpt',
  3: 'mt',
  4: 'tgl',
  5: 'end',
  6: 'socd',
  7: 'rs',
};
emitter.on('key-click', (data: { row: number; col: number }) => {
  if (activeMenu.value !== 'customKey') return;
  const { row, col } = data;
  const keycode = keyboardStore.getKeycode({ row, col });
  const keyItem = keyboardStore.keyboardLayout[row][col];
  const keycodes = [];
  const pos = [];
  let hasHighLevelKey = null;
  // newVal.forEach((item) => {
  // 判断是不是高级键
  if (keyItem !== null) hasHighLevelKey = keyItem.advancedKeys;
  keycodes.push(keycode);
  if (tabItem.value === 'socd' || tabItem.value === 'rs') {
    if (socdKeycodes.length === 2) {
      socdKeycodes.shift();
    }
    socdKeycodes.push(keycode);
  } else {
    socdKeycodes.length = 0;
  }
  pos.push({ row, col });
  // });
  // 判断当前是不是高级键，如果是高级键的话 我要去高级键的数据存储中拿到对应的数据
  if (hasHighLevelKey !== null && hasHighLevelKey.advancedType !== '') {
    const { advancedType } = hasHighLevelKey;
    const type = TYPE_MAPPING[advancedType];
    console.log('type', type);
    tabItem.value = type;
    emitter.emit('highLevelKey-change', { value: type });
    keyboardStore.activeKeys.push(`${row}-${col}`);
    if (type === 'socd') {
      const { socd } = hasHighLevelKey;
      const { col2, row2, delay, kcs, socdMode } = socd.socd;
      if (keycodes.length === 2) {
        const [key1, key2] = kcs;
        const [pos1, pos2] = pos;
        socdInfo.pos[0] = pos1;
        socdInfo.pos[1] = pos2;
        socdInfo.kcs[0] = key1;
        socdInfo.kcs[1] = key2;
        socdInfo.delay = delay;
        socdInfo.mode = socdMode;
      } else {
        keyboardStore.activeKeys = [];
        keyboardStore.activeKeys.push(`${row}-${col}`);
        keyboardStore.activeKeys.push(`${row2}-${col2}`);
        const [key1, key2] = kcs;
        const [pos1, pos2] = pos;
        socdInfo.pos[0] = pos1;
        socdInfo.pos[1] = pos2;
        socdInfo.kcs[0] = key1;
        socdInfo.kcs[1] = key2;
        socdInfo.delay = delay;
        socdInfo.mode = socdMode;
      }
    } else if (type === 'rs') {
      const { rs } = hasHighLevelKey;
      const { col2, row2, delay, kcs } = rs.rs;
      console.log('rs.rs', rs.rs);
      if (keycodes.length === 2) {
        const [key1, key2] = kcs;
        // const [pos1, pos2] = pos;
        rsInfo.kcs[0] = key1;
        rsInfo.kcs[1] = key2;
        rsInfo.delay = delay;
        // rsInfo.mode = socdMode;
      } else {
        keyboardStore.activeKeys = [];
        keyboardStore.activeKeys.push(`${row}-${col}`);
        keyboardStore.activeKeys.push(`${row2}-${col2}`);
        const [key1, key2] = kcs;
        // const [pos1, pos2] = pos;
        // socdInfo.pos[0] = pos1;
        // socdInfo.pos[1] = pos2;
        rsInfo.kcs[0] = key1;
        rsInfo.kcs[1] = key2;
        rsInfo.delay = delay;
        // rsInfo.mode = socdMode;
      }
    } else if (type === 'dks') {
      const { dks } = hasHighLevelKey;
      const { trps, dks: dksAll, db, db2 } = dks;
      dksInfo.trps = trps;
      dksInfo.dks = dksAll;
      dksInfo.db = db;
      dksInfo.db2 = db2;
    } else if (type === 'mpt') {
      const { mpt } = hasHighLevelKey;
      const { dbs, dks } = mpt;
      mptInfo.dks = dks;
      mptInfo.dbs = dbs.map((item) => item);
    } else if (type === 'mt') {
      const { mt } = hasHighLevelKey;
      const { dksAll, delay } = mt.mt;
      mtInfo.delay = delay;
      const [dks1, dks2] = dksAll;
      mtInfo.dks[0] = dks1;
      mtInfo.dks[1] = dks2;
    } else if (type === 'tgl') {
      const { tgl } = hasHighLevelKey;
      const { kc, delay } = tgl.tgl;
      tglInfo.kc = kc;
      tglInfo.delay = delay;
    } else if (type === 'end') {
      const { end } = hasHighLevelKey;
      const { dks, delay } = end.end;
      const [dks1, dks2] = dks;
      endInfo.dks[0] = dks1;
      endInfo.dks[1] = dks2;
      endInfo.delay = delay;
    }
    isEdit.value = true;
  } else {
    const [key1] = keycodes;
    const type = tabItem.value;
    if (type === 'socd') {
      const keyCodes = [];
      keyboardStore.activeKeys = keyboardStore.activeKeys.filter((item) => {
        const [row, col] = item.split('-').map(Number);
        const keycode = keyboardStore.getKeycode({ row, col });
        keyCodes.push(keycode);
        const keyItem = keyboardStore.keyboardLayout[row][col];
        return keyItem.advancedKeys.advancedType !== 6;
      });
      const [key1, key2] = keyCodes;
      Object.assign(socdInfo, { pos: [0, 0], kcs: [key1, key2], type: 0, mode: 0, delay: 0 });
    } else if (type === 'rs') {
      const keyCodes = [];
      keyboardStore.activeKeys = keyboardStore.activeKeys.filter((item) => {
        const [row, col] = item.split('-').map(Number);
        const keycode = keyboardStore.getKeycode({ row, col });
        keyCodes.push(keycode);
        const keyItem = keyboardStore.keyboardLayout[row][col];
        return keyItem.advancedKeys.advancedType !== 7;
      });
      const [key1, key2] = keyCodes;
      Object.assign(rsInfo, { kcs: [key1, key2], delay: 0 });
    } else if (type === 'dks') {
      Object.assign(dksInfo, { dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.5, db2: 3.0 });
    } else if (type === 'mpt') {
      Object.assign(mptInfo, { dks: [key1, 0, 0], dbs: [0.5, 1.0, 1.5] });
    } else if (type === 'mt') {
      Object.assign(mtInfo, { dks: [key1, 0], delay: 200 });
    } else if (type === 'tgl') {
      Object.assign(tglInfo, { kc: key1, delay: 200 });
    } else if (type === 'end') {
      Object.assign(endInfo, { dks: [key1, 0], delay: 200 });
    }
  }
});

const tabItem: Ref<string | number> = ref(0);
const onChangeTab = (val: number | string) => {
  isEdit.value = false;
  tabItem.value = val;
  socdKeycodes.length = 0;
  activeKeys.value.length = 0;
  Object.assign(socdInfo, { pos: [0, 0], kcs: [0, 0], type: 0, mode: 0, delay: 0 });
  Object.assign(rsInfo, { kcs: [0, 0], delay: 0 });
  emitter.emit('highLevelKey-change', { value: val });
};

const toAdd = (value: string) => {
  tabItem.value = value;
};

// 编辑
const edit = (value: { option: any; item: any }) => {
  const { option, item } = value;
  if (option.value === 3) {
    // 判断是否是SOCD
    if (item.advancedType === 6) {
      deleteHighLevelKey({ row: item.row, col: item.col });
      deleteHighLevelKey({ row: item.socd.socd.row2, col: item.socd.socd.col2 });
    } else {
      deleteHighLevelKey({ row: item.row, col: item.col });
    }
    resetDefaultValue();
    // showMessage('删除成功!');
    MessagePlugin.success('删除成功');
  }
};

// 添加对于新值
const activeAddNew = () => {
  keyboardStore.cancelSelectKey();
  isEdit.value = true;
};
// 计算当前选择的高级键
const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});
// 保存事件
const handleSaveBIndKeyClick = () => {
  if (activeKeys.value.length === 0) return;
  handleDialoConfirm();
};
const handleCancelClick = () => {
  keyboardStore.cancelSelectKey();
  resetDefaultValue();
  isEdit.value = false;
};
</script>

<style scoped>
.tabs-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
  font-family: 'Bold';
  .tab {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .search {
    width: 300px;
  }
  .tab-list {
    width: 1180px;
  }
  .btn-box {
    display: flex;
    flex-direction: row;
    justify-content: right;
    gap: 18px;
    .btn-confirm,
    .btn-cancel {
      width: 112px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      background-image: url('@/assets/images/btn-confirm.svg');
      background-size: 100% 100%;
      cursor: pointer;
      &:hover {
        color: rgba(9, 251, 211, 1);
        background-image: url('@/assets/images/btn-confirm_hover.svg');
      }
    }
  }
}
.content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 20px;

  .setting-box {
    width: 400px;
    height: 340px;
    overflow: auto;
    margin-top: 28px;
    margin-left: 60px;
    border-left: 2px solid #404040;
    border-right: 2px solid #404040;
    display: flex;
    flex-direction: column;
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #666;
      border-radius: 3px;
      /* 设置滚动条距离右侧边距,避免圆角溢出 */
      margin-right: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #383838;
      border-radius: 3px;
      /* 设置轨道距离右侧边距,避免圆角溢出 */
      margin-right: 4px;
    }
    .setting-box-text {
      width: 100%;
      height: 40px;
      display: flex;
      flex-direction: column;
      justify-content: left;
      padding: 0 40px;
      gap: 5px;
      .title {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
        font-family: 'Bold';
      }
      .desc {
        font-size: 14px;
        font-weight: 400;
        color: #999999;
        font-family: 'Regular';
      }
    }
  }
}
</style>
