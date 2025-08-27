<template>
  <div class="device-keyboard">
    <div v-px2rem="{ styles: () => styles }" class="device-keyboard-container">
      <!-- 键盘操作 -->
      <div class="device-keyboard-container__sidebar-left">
        <!-- <template v-if="currentPageName === 'customKey' || currentPageName === 'macro'">
          <div
            v-for="(ite, idx) in 4"
            :key="ite"
            class="select-btn"
            :class="{ active: idx === fnLayer }"
            :data-idx="idx"
            @click.capture="handleFnChange(idx)"
          >
            <span>
              {{
                idx === 0
                  ? t('messages.keyboardMainLayer')
                  : t('messages.keyboardFnLayer') + idx + t('messages.FnLayer')
              }}
            </span>
          </div>
        </template>
        <template v-if="currentPageName === 'customKey'">
          <div class="select-btn-line"></div>
          <div
            v-for="(ite, idx) in SYSTEM_MAP"
            :key="ite.value"
            class="select-btn"
            :class="{ active: ite.value === system }"
            :data-idx="idx"
            @click.capture="handleSystemChange(idx)"
          >
            {{ ite.name }}
          </div>
        </template> -->
      </div>
      <template v-for="(row, rowIndex) in layout" :key="rowIndex">
        <template v-for="(column, colIndex) in row" :key="`${rowIndex}-${colIndex}`">
          <template v-if="column.shapeScale.w != 0">
            <key-cap
              :row="rowIndex"
              :column="colIndex"
              :location="column.location"
              :shape-scale="column.shapeScale"
              :current-page-name="currentPageName"
              :active="activeKeys.includes(`${rowIndex}-${colIndex}`)"
              :draggable="currentPageName === 'customKey'"
              @click="handleKeyClick(rowIndex, colIndex)"
              @dragstart="(e) => dragstart(e, rowIndex, colIndex)"
              @dragenter="(e) => e.preventDefault()"
              @dragover="(e) => e.preventDefault()"
              @drop="handleKeyCapDrop($event, { row: rowIndex, col: colIndex })"
            >
            </key-cap>
          </template>
        </template>
      </template>
      <!-- 侧边 -->
      <div v-if="['customKey'].includes(currentPageName) && isCheckVersion" class="device-keyboard-container__sidebar">
        <div class="select-btn-custom" @click="restoreDefaultLayout">恢复默认</div>
        <template v-if="currentPageName === 'customKey' || currentPageName === 'macro'">
          <div
            v-for="(ite, idx) in 4"
            :key="ite"
            class="select-btn"
            :class="{ active: idx === fnLayer }"
            :data-idx="idx"
            @click.capture="handleFnChange(idx)"
          >
            <span>
              {{
                idx === 0
                  ? t('messages.keyboardMainLayer')
                  : t('messages.keyboardFnLayer') + idx + t('messages.FnLayer')
              }}
            </span>
          </div>
        </template>
        <!-- <template v-if="currentPageName === 'customKey'">
          <div class="select-btn-line"></div>
          <div
            v-for="(ite, idx) in SYSTEM_MAP"
            :key="ite.value"
            class="select-btn"
            :class="{ active: ite.value === system }"
            :data-idx="idx"
            @click.capture="handleSystemChange(idx)"
          >
            {{ ite.name }}
          </div>
        </template> -->
      </div>
      <div
        v-if="['performance'].includes(currentPageName) && performanceTab !== 4"
        class="device-keyboard-container__sidebar"
      >
        <div class="select-btn" @click="onCheckKey('WASD')">WASD</div>
        <div class="select-btn" @click="onCheckKey('all')">{{ t('messages.keyboardSelectAll') }}</div>
        <div class="select-btn" @click="onCheckKey('reverse')">{{ t('messages.keyboardSelectReverse') }}</div>
        <div class="select-btn" @click="onCheckKey('cancel')">{{ t('messages.keyboardSelectCancel') }}</div>
      </div>
      <!-- <div
        v-if="['customKey', 'highLevelKey', 'macro', 'performance'].includes(currentPageName)"
        class="device-keyboard-container__tip"
      >
        <img
          v-show="
            (currentPageName === 'performance' && performanceTab !== 4) ||
            currentPageName === 'customKey' ||
            currentPageName === 'macro'
          "
          :class="{ iscustomKey: currentPageName === 'customKey' || currentPageName === 'macro' }"
          src="@/assets/images/slider-up.png"
          alt="tip"
        />
        <p v-show="currentPageName === 'highLevelKey'">
          <t-icon name="mouse" size="14" style="margin-right: 2px" />{{ t('messages.keyboardBindTip') }}
        </p>
        <p v-show="currentPageName === 'performance' && performanceTab !== 4">{{ t('messages.keyboardEditTip') }}</p>
        <p v-show="currentPageName === 'performance' && performanceTab === 4">
          <t-icon name="gesture-press" size="14" style="margin-right: 2px" />{{ t('messages.keyboardCalibrateTip') }}
        </p>
        <p v-show="currentPageName === 'customKey'">{{ t('messages.keyboardCustomTip') }}</p>
        <p v-show="currentPageName === 'macro'">{{ t('messages.keyboardMacroTip') }}</p>
      </div> -->
    </div>
    <t-dialog
      v-model:visible="visible"
      theme="warning"
      :header="t('messages.keyboardDialogTitle')"
      :body="t('messages.keyboardDialogBody')"
      :confirm-btn="t('common.confirm')"
      :cancel-btn="null"
      @confirm="handleSwitchSystem"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeviceKeyboard' });

import { storeToRefs } from 'pinia';
import { MessagePlugin, DialogPlugin, LoadingPlugin } from 'tdesign-vue-next';
import { useVersionHooks } from '@/hooks/version/useVersionHooks';
import { useGlobalStore, useKeyboardStore, usePerformanceStore } from '@/store';
import type { MenuClickData, SystemItem } from '@/types/keyboard';
import emitter from '@/utils/app-emitter';
import { filterAdvancedKeyByPosition } from '@/utils/filter-key';
import KeyCap from './key-caps/index.vue';

import { useKeyboardStyle } from '../hooks/useKeyboardStyle';
import { t } from '@/locales';

const props = defineProps<{ propsVisible: boolean }>();
const { layout, containerDimensions } = useKeyboardStyle();
const keyboardStore = useKeyboardStore();
const globalStore = useGlobalStore();
const performanceStore = usePerformanceStore();
const { fnLayer } = storeToRefs(keyboardStore);
const { system } = storeToRefs(globalStore);
const { isCheckVersion } = useVersionHooks('1.0.6.0');
const isMultipleSelect = ref<boolean>(false);
const highLevelKey = ref<string>('socd');
const currentPageName = ref<string>('performance');

const { performanceTab } = storeToRefs(performanceStore);
const visible = ref<boolean>(false);
const idx1 = ref<number>(0);
const SYSTEM_MAP: SystemItem[] = [
  { name: 'WIN', value: 'WIN' },
  { name: 'MAC', value: 'MAC' },
];

computed(() => ({}));

const styles = reactive({ width: '885px', height: '350px' });

const multipleHighLevelKey: string[] = ['socd', 'rs'];

emitter.on('menu-click', (data: MenuClickData) => {
  currentPageName.value = data.value as string;
  keyboardStore.cancelSelectKey();
});

emitter.on('highLevelKey-change', ({ value }: MenuClickData) => {
  highLevelKey.value = value as string;
  if (multipleHighLevelKey.includes(value as string)) {
    isMultipleSelect.value = true;
  } else if (isMultipleSelect.value) {
    isMultipleSelect.value = false;
    keyboardStore.cancelSelectKey();
  }
});
const dragstart = (e, rowIndex: number, colIndex: number) => {
  if (currentPageName.value !== 'customKey') {
    return;
  }
  e.stopPropagation();
  // 更新全局缓存
  keyboardStore.updateSelectKeycode(keyboardStore.keyboardLayout[rowIndex][colIndex].keyValue);
};
watchEffect(() => {
  if (props.propsVisible) {
    styles.width = `${containerDimensions.value.width}px`;
    styles.height = `${Number(containerDimensions.value.height) - 20}px`;
  }
});

const activeKeys: ComputedRef<string[]> = computed(() => keyboardStore.activeKeys);

const handleFnChange = async (index: number): Promise<void> => {
  keyboardStore.checkFnLayer(index);
  await resetKeyboard();
};

const handleKeyClick = async (row: number, col: number): Promise<void> => {
  // 当前类型
  if (currentPageName.value === 'highLevelKey' || currentPageName.value === 'customKey') {
    // 单选
    if (
      (currentPageName.value === 'highLevelKey' || currentPageName.value === 'customKey') &&
      multipleHighLevelKey.includes(highLevelKey.value)
    ) {
      handleHighLevelKeyChange({ row, col });
    } else {
      keyboardStore.handleSelectKeyClick({ row, col }, 'single');
    }
  } else {
    // 多选
    keyboardStore.handleSelectKeyClick({ row, col });
  }
  emitter.emit('key-click', { row, col });
};

// 处理高级键的双键绑定
const handleHighLevelKeyChange = ({ row, col }: { row: number; col: number }): void => {
  keyboardStore.handleHighLevelKeyClick({ row, col });
};

const handleKeyCapDrop = (e: Event, { row, col }: { row: number; col: number }): void => {
  if (currentPageName.value !== 'customKey' && currentPageName.value !== 'macro') {
    return;
  }
  console.log('handleKeyCapDrop');
  const unBinding = filterAdvancedKeyByPosition(keyboardStore.keyboardLayout, { row, col });
  if (unBinding) {
    MessagePlugin.error(t('messages.isExistAdanceKey'));
    return;
  }
  if (keyboardStore.keyLayoutStyle[row][col].ratio === 12) return;
  keyboardStore.updateSelectKey({ row, col });
  const specialKey = [61696, 61697, 61698, 61699];
  if (specialKey.includes(keyboardStore.selectKey.keycode) && keyboardStore.fnLayer !== 3) {
    const dialog = DialogPlugin.confirm({
      header: t('messages.keyboardDialogTitle'),
      body: t('messages.keyboardFnClearTip'),
      onConfirm: () => {
        keyboardStore.setKeyCode();
        dialog.destroy();
      },
    });
    // keyboardStore.setKeyCode();
  } else {
    keyboardStore.setKeyCode();
  }
};

const resetKeyboard = async (): Promise<void> => {
  await keyboardStore.getKeyLayout({
    layer: fnLayer.value,
  });
};

const handleSystemChange = async (idx: number): Promise<void> => {
  visible.value = true;
  idx1.value = idx;
};

const handleSwitchSystem = async (): Promise<void> => {
  globalStore.updateSystem(SYSTEM_MAP[idx1.value].value);
  await globalStore.setSystem();
  visible.value = false;
  keyboardStore.checkFnLayer(0);
  await keyboardStore.getKeyLayoutStyle();
  await resetKeyboard();
  MessagePlugin.success(t('messages.keyboardSwitchSuccess'));
};

const onCheckKey = (value: string): void => {
  if (value === 'WASD') {
    keyboardStore.selectWasdKey();
  } else if (value === 'all') {
    keyboardStore.selectAllKey();
  } else if (value === 'reverse') {
    keyboardStore.selectReverseKey();
  } else if (value === 'cancel') {
    keyboardStore.cancelSelectKey();
  }
};

const restoreDefaultLayout = async (): Promise<void> => {
  const loading = LoadingPlugin({
    text: t('messages.restoreing'),
    // loading: true,
  });

  await keyboardStore.restoreDefaultLayout();
  await resetKeyboard();

  loading.hide();
};

onBeforeUnmount((): void => {
  emitter.off('menu-click');
  // emitter.off('performance-tab');
  emitter.off('highLevelKey-change');
});
</script>

<style scoped lang="less">
@import './index.less';

.grabbing {
  cursor: grabbing !important;
}

.grab {
  cursor: grab;
}
</style>
