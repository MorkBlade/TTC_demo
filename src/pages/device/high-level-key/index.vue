<template>
  <div class="device-custom-key__advanced">
    <div class="advanced-menu">
      <div v-for="item in advancedKeyMenu" :key="item.value">
        <span :class="{ active: active === item.value }" @click="handleChangeAdvanced(item.value)">
          {{ item.label }}
        </span>
        <t-tooltip v-if="active === item.value" :content="t('messages.learnMore')" placement="top">
          <t-icon
            :class="{ 'show-icon': active === item.value }"
            name="info-circle"
            size="20"
            @click="showAdvanceTip(item.value)"
          />
        </t-tooltip>
      </div>
    </div>
    <!-- 按键绑定 -->
    <div class="advanced-binding">
      <div class="head">
        <div class="bind-key">
          <p>{{ t('messages.highKeyBind') }}</p>
          <div v-if="showBindKey">{{ activeKeyText[0] }}</div>
          <template v-else>
            <div v-for="(item, index) in Array(2).fill(0)" :key="item">{{ activeKeyText[index] }}</div>
          </template>
        </div>
        <div class="btn-group">
          <div class="btn sure-btn has-data" @click="handleSaveBIndKeyClick">{{ t('messages.highKeyConfirm') }}</div>
          <div class="btn" @click="handleDeleteBIndKeyClick">{{ t('messages.highKeyDelete') }}</div>
        </div>
      </div>
      <div class="body">
        <socd v-if="active === 'socd'" ref="childRef" v-model:socd-info="socdInfo" />
        <dks
          v-if="active === 'dks'"
          ref="childRef"
          v-model:dks-info="dksInfo"
          :edit="edit"
          :edit-key="editKey"
          @handle-key-type-change="handleKeyTypeChange"
          @handle-dialo-confirm="handleDialoConfirm"
        />
        <mpt v-if="active === 'mpt'" ref="childRef" v-model:mpt-info="mptInfo" :edit="edit" :edit-key="editKey" />
        <mt v-if="active === 'mt'" ref="childRef" v-model:mt-info="mtInfo" :edit="edit" :edit-key="editKey" />
        <tgl v-if="active === 'tgl'" ref="childRef" v-model:tgl-info="tglInfo" :edit="edit" :edit-key="editKey" />
        <end v-if="active === 'end'" ref="childRef" v-model:end-info="endInfo" :edit="edit" :edit-key="editKey" />
        <rs v-if="active === 'rs'" ref="childRef" v-model:rs-info="rsInfo" :edit="edit" :edit-key="editKey" />
      </div>
    </div>
    <div class="advanced-right">
      <div class="tipInfo">
        <p><t-icon name="info-circle" size="14" style="margin-right: 2px" />{{ t('messages.highKeyDragTip') }}</p>
      </div>
      <div class="advanced-characters">
        <characterCard :characters="BASIC_CHARACTER" />
        <characterCard :characters="EXTEND_CHARACTER" :title="t('messages.highKeyCharExtend')" />
        <characterCard :characters="KEYBOARD_CHARACTER" :title="t('messages.highKeyCharKeyboard')" />
        <characterCard :characters="SPECIAL_CHARACTER" :title="t('messages.highKeyCharSpecial')" />
      </div>
    </div>
  </div>
  <advanced-key-dialog
    :visible="visible"
    :key-type="active"
    :video-url="getVideoUrl(active)"
    @close="visible = false"
  />
</template>

<script lang="ts" setup>
import { MessagePlugin, MessageInstance } from 'tdesign-vue-next';
import AdvancedKeyDialog from './AdvancedKeyDialog';
import Mt from '@/assets/video/mt.webm';
import Tgl from '@/assets/video/tgl.webm';
import End from '@/assets/video/end.webm';
import Dks from '@/assets/video/dks.webm';
import Mpt from '@/assets/video/mpt.webm';
import Socd from '@/assets/video/socd_thick.webm';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { BASIC_CHARACTER, EXTEND_CHARACTER, KEYBOARD_CHARACTER, SPECIAL_CHARACTER } from '@/config/constant';
import { useHigherKeyStore, useKeyboardStore, useConfigStore } from '@/store';
import emitter from '@/utils/app-emitter';
import { t } from '@/locales';

import characterCard from './components/character-card.vue';
import dks from './components/dks/index.vue';
import end from './components/end/index.vue';
import mpt from './components/mpt/index.vue';
import mt from './components/mt/index.vue';
import socd from './components/socd/index.vue';
import tgl from './components/tgl/index.vue';
import rs from './components/rs/index.vue';
import useSetAdvanced from './useSetAdvanced';

const advancedKeyMenu = computed(() => [
  { label: t('messages.highKeyMenuSocd'), value: 'socd' },
  { label: t('messages.highKeyMenuDks'), value: 'dks' },
  { label: t('messages.highKeyMenuMpt'), value: 'mpt' },
  { label: t('messages.highKeyMenuMt'), value: 'mt' },
  { label: t('messages.highKeyMenuTgl'), value: 'tgl' },
  { label: t('messages.highKeyMenuEnd'), value: 'end' },
  // { label: t('messages.highKeyMenuRs'), value: 'rs' },
]);

const keyboardStore = useKeyboardStore();
const highLevelKeyStore = useHigherKeyStore();
const configStore = useConfigStore();
const { activeMenu } = storeToRefs(configStore);
const {
  childRef,
  edit,
  editKey,
  socdInfo,
  dksInfo,
  mtInfo,
  mptInfo,
  tglInfo,
  endInfo,
  rsInfo,
  handleKeyTypeChange,
  handleDialoConfirm,
} = useSetAdvanced();
console.log('rsInfo9999', rsInfo);
console.log('socdInfo9999', socdInfo);
const active = ref('socd');
const msg = ref<Promise<MessageInstance> | null>(null);
const socdKeycodes = [];
const visible = ref(false);
const videoMap = {
  dks: Dks,
  mpt: Mpt,
  mt: Mt,
  tgl: Tgl,
  end: End,
  socd: Socd,
};
const getVideoUrl = (type) => {
  return videoMap[type];
};

emitter.on('key-click', (data: { row: number; col: number }) => {
  if (activeMenu.value !== 'highLevelKey') return;
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
  if (active.value === 'socd' || active.value === 'rs') {
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
    active.value = type;
    emitter.emit('highLevelKey-change', { value: type });
    keyboardStore.activeKeys.push(`${row}-${col}`);
    if (type === 'socd') {
      const { socd } = hasHighLevelKey;
      const { col2, row2, delay, kcs, socdMode } = socd.socd;
      console.log('socd.socd', socd.socd);
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
  } else {
    const [key1] = keycodes;
    const type = active.value;
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

// 计算当前选择的高级键
const activeKeys = computed(() => {
  return keyboardStore.activeKeys;
});

// 计算文本
const activeKeyText = computed(() => {
  if (activeKeys.value.length === 0) return '';
  const keycodes = activeKeys.value.map((item) => {
    const [row, col] = item.split('-').map(Number);
    const keycode = keyboardStore.getKeycode({ row, col });
    return keyboardMap[keycode]?.name || '';
  });
  return keycodes;
});

const showBindKey = computed(() => {
  return active.value !== 'socd' && active.value !== 'rs';
});

const TYPE_MAPPING = {
  1: 'dks',
  2: 'mpt',
  3: 'mt',
  4: 'tgl',
  5: 'end',
  6: 'socd',
  7: 'rs',
};

const showAdvanceTip = (type) => {
  console.log('type', type);
  visible.value = true;
};

//  高级键模式切换事件
const handleChangeAdvanced = (data) => {
  active.value = data;
  socdKeycodes.length = 0;
  activeKeys.value.length = 0;
  Object.assign(socdInfo, { pos: [0, 0], kcs: [0, 0], type: 0, mode: 0, delay: 0 });
  Object.assign(rsInfo, { kcs: [0, 0], delay: 0 });
  emitter.emit('highLevelKey-change', { value: data });
};

// 保存事件
const handleSaveBIndKeyClick = () => {
  if (activeKeys.value.length === 0) return;
  handleDialoConfirm();
};

// 删除事件
const handleDeleteBIndKeyClick = async () => {
  if (activeKeys.value.length === 0) {
    if (msg.value) MessagePlugin.close(msg.value);
    msg.value = MessagePlugin.error(t('messages.highKeyDeleteFail'));
    return;
  }
  if (active.value === 'socd') {
    activeKeys.value.forEach(async (item) => {
      const [row, col] = item.split('-').map(Number);
      await highLevelKeyStore.deleteHighLevelKey({ row, col });
      socdKeycodes.length = 0;
      activeKeys.value.length = 0;
      Object.assign(socdInfo, { pos: [0, 0], kcs: [0, 0], type: 0, mode: 0, delay: 0 });
    });
  } else if (active.value === 'rs') {
    activeKeys.value.forEach(async (item) => {
      const [row, col] = item.split('-').map(Number);
      await highLevelKeyStore.deleteHighLevelKey({ row, col });
      activeKeys.value.length = 0;
      Object.assign(rsInfo, { kcs: [0, 0], delay: 0 });
    });
  } else {
    const [row, col] = activeKeys.value[0].split('-').map(Number);
    await highLevelKeyStore.deleteHighLevelKey({ row, col });
  }
  keyboardStore.cancelSelectKey();
  keyboardStore.updateSelectKey({ row: null, col: null });
};
</script>

<style scoped>
.advanced-key-dialog {
  --td-dialog-width: 800px;
}
.dialog-content {
  padding: 24px;
}
.description {
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--td-text-color-primary);
}
.key-video {
  width: 100%;
  max-height: 450px;
  border-radius: 5px;
  object-fit: contain;
}

.keyboard-feature-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #e0e0e0;
}

h1 {
  text-align: center;
  color: #ffd700;
  margin-bottom: 2rem;
  font-size: 2.2rem;
}

.key-type-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.type-btn {
  background: linear-gradient(135deg, #2a2a3a, #1e1e2f);
  border: 1px solid #444;
  color: #b0b0b0;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 1.1rem;
}

.type-btn:hover {
  border-color: #ffd700;
  color: #ffd700;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.type-btn.active {
  background: linear-gradient(135deg, #ff8a00, #ff2070);
  color: white;
  border-color: transparent;
}
</style>

<style scoped lang="less">
@import './index.less';
</style>
