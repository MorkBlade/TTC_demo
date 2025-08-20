<template>
  <div class="recorder-container">
    <div class="recorder-card">
      <!-- Header -->
      <div class="recorder-header">
        <div class="help-text">
          <t-tooltip :content="t('messages.macroTooltipContent')">
            <icon-font class="key-explain-icon" name="info-circle-filled" />
          </t-tooltip>
        </div>
        <div class="recorder-controls">
          <div class="clear-button" v-bind="recording ? { disabled: true } : {}" @click="clearData">
            {{ t('messages.macroClearData') }}
          </div>
          <div class="toggle-container" @click="toggleRecording">
            <span class="toggle-point" :class="{ 'toggle-point-active': recording }"></span>
            <span class="toggle-label" :class="{ 'toggle-label-active': recording }">
              {{ recording ? t('messages.macroEndRecording') : t('messages.macroStartRecording') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Keystroke Grid -->
      <div v-if="macros.data.length > 0" class="keystroke-grid">
        <div
          v-for="(record, index) in displayRecords"
          :key="record.id || `placeholder-${index}`"
          class="keystroke-item"
          :data-index="index"
          :class="{
            'drag-over': dragOverIndex === index && !record.isPlaceholder,
            'waiting-placeholder': record.isPlaceholder,
          }"
          @dragenter="dragEnter(index, $event)"
          @dragleave="dragLeave(index, $event)"
          @dragover="dragOver(index, $event)"
          @drop="drop(index, $event)"
        >
          <div
            v-if="!record.isPlaceholder"
            class="keystroke-card"
            :draggable="editingIndex === null"
            :class="{ dragging: draggedItem === index }"
            @dragstart="dragStart(index, $event)"
            @dragend="dragEnd"
            @mouseenter="enterItem = index"
            @mouseleave="enterItem = -1"
          >
            <span class="key-letter">{{ keyboardMap[record.keyCode]?.name || '' }}</span>
            <span class="key-direction">
              <icon-font v-if="record.status === 0" class="direction-up" name="chevron-up-double" />
              <icon-font v-else class="direction-down" name="chevron-down-double" />
            </span>
            <t-icon class="add-key" name="add-circle" @click="addMacroKey(index)" />
            <t-icon class="add-key" name="edit" @click="editMacroKey(index)" />
            <div class="time-container">
              <t-icon class="key-time-icon" name="time" />
              <span class="key-time">{{ record.delay }} ms</span>
            </div>
            <t-icon data-key="del" class="key-del-icon" name="close-circle" @click="delMacroKey(index)" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="macros.data.length === 0" class="empty-message">
        {{ recording ? t('messages.macroEmptyRecording') : t('messages.macroEmptyNotRecording') }}
      </div>

      <!-- 编辑对话框 -->
      <div v-if="editingIndex !== null" class="edit-dialog-overlay">
        <div class="edit-dialog" @click.stop>
          <div class="edit-dialog-content">
            <div class="edit-dialog-header">
              <h3>{{ isAdding ? t('messages.macroInsertKeyRecord') : t('messages.macroEditKeyRecord') }}</h3>
              <icon-font class="close-icon" name="close" @click="cancelEdit" />
            </div>
            <div class="edit-form">
              <div class="form-group">
                <label>{{ t('messages.macroKey') }}</label>
                <input
                  v-model="editingKey"
                  type="text"
                  @keydown.prevent="handleKeyInput"
                  @input="handleInput"
                  @compositionstart="isComposing = true"
                  @compositionend="onCompositionEnd"
                />
              </div>
              <div class="form-group">
                <label>{{ t('messages.macroDirection') }}</label>
                <select v-model="editingDirection">
                  <option :value="0">{{ t('messages.macroDirectionUp') }}</option>
                  <option :value="1">{{ t('messages.macroDirectionDown') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('messages.macroTime') }}</label>
                <input
                  v-model.number="editingTime"
                  type="text"
                  min="1"
                  @input="handleNumberInput"
                  @keyup.enter="saveEdit"
                />
              </div>
              <div class="dialog-buttons">
                <button class="cancel-button" @click="cancelEdit">{{ t('messages.macroCancel') }}</button>
                <button class="save-button" @click="saveEdit">{{ t('messages.macroSave') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { IconFont } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import emitter from '@/utils/app-emitter';
import { KEY_VALUE_DICTIONARY } from '@/config/constant';
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import { useConfigStore } from '@/store';
import { t } from '@/locales';

const configStore = useConfigStore();

const emit = defineEmits(['confirm']);

const macros = defineModel('macros', {
  type: Object,
  default: () => ({ data: [] }),
});

// State
const recording = ref(false);
const lastKeyTime = ref(10);
const draggedItem = ref(null);
const dragOverIndex = ref(null);
// const enterState = ref(-1);
const enterItem = ref(-1);

// Editing state
const editingIndex = ref(null);
const editingKey = ref('');
const editingKeyCode = ref('');
const editingDirection = ref(0);
const editingTime = ref(0);

// 鼠标和拖拽状态
const mouseDownTime = ref(0);
const isDragging = ref(false);

// 添加一个状态来区分是编辑还是新增
const isAdding = ref(false);

// 添加一个变量存储输入的 keyCode
const inputKeyCode = ref(null);
const inputCode = ref('');

// 添加一个状态来跟踪按键是否已经按下
const pressedKeys = ref(new Set());

const keyValueDictionary = KEY_VALUE_DICTIONARY;

// 计算属性：处理显示记录
const displayRecords = computed(() => {
  if (draggedItem.value === null || dragOverIndex.value === null) {
    return macros.value.data;
  }

  const records = [...macros.value.data];
  const placeholder = { isPlaceholder: true, id: 'placeholder' };

  records.splice(draggedItem.value, 1);
  records.splice(dragOverIndex.value, 0, placeholder);

  return records;
});

// Key event handlers
const handleKeyDownAndUp = (e) => {
  if (!recording.value) return;
  if (editingIndex.value !== null) return;
  e.preventDefault();
  const currentTime = Date.now();
  const { keyCode, code, type } = e;
  const data = { status: type === 'keydown' ? 1 : 0, delay: 0, keyCode: 0 };
  let keyValue = keyValueDictionary[keyCode];
  const specialKeys = [
    [16, '', 500],
    [17, 'ControlRight', 501],
    [18, 'AltRight', 502],
  ];
  const [_keyCode, _code, dictKey] = specialKeys.find(([k, c]) => keyCode === k && code === c) || [];
  if (dictKey) keyValue = keyValueDictionary[dictKey];
  data.keyCode = keyValue;

  if (lastKeyTime.value) {
    data.delay = currentTime - lastKeyTime.value;
  }

  // 修改上一次的时间
  if (macros.value.data.length > 0 && macros.value.data[macros.value.data.length - 1]) {
    macros.value.data[macros.value.data.length - 1].delay = data.delay;
  }

  // 只在按键首次按下时添加记录，或者按键释放时添加记录
  if ((type === 'keydown' && !pressedKeys.value.has(keyCode)) || type === 'keyup') {
    if (macros.value.data.length < 64) {
      macros.value.data.push(data);
    }
    // 最后一个值设置为10ms
    if (macros.value.data.length > 0) {
      macros.value.data[macros.value.data.length - 1].delay = 10;
    }
    lastKeyTime.value = currentTime;
  }

  // 更新按键状态
  if (type === 'keydown') {
    pressedKeys.value.add(keyCode);
  } else if (type === 'keyup') {
    pressedKeys.value.delete(keyCode);
  }
};
const handleNumberInput = (e) => {
  // 实时过滤非数字字符
  e.target.value = e.target.value.replace(/[^\d]/g, '');
  editingTime.value = e.target.value; // 更新 v-model
};

const addMacroKey = (idx: number) => {
  // 创建一个新的空记录
  const newRecord = {
    keyCode: 0,
    status: 0,
    delay: 0,
  };

  // 在当前位置和下一个位置之间插入新记录
  macros.value.data.splice(idx + 1, 0, newRecord);

  // 设置状态为新增
  isAdding.value = true;

  // 打开编辑对话框，注意这里使用 idx + 1 因为新记录在下一个位置
  startEditing(idx + 1);
};

const delMacroKey = (idx: number) => {
  macros.value.data.splice(idx, 1);
  cancelEdit();
};

const clearData = () => {
  if (!recording.value) {
    macros.value.data = [];
    lastKeyTime.value = null;
    cancelEdit();
  }
};

const toggleRecording = () => {
  if (!recording.value) {
    // 开始录制逻辑
    // lastKeyTime.value = Date.now();
    recording.value = !recording.value;
  } else {
    recording.value = !recording.value;
    cancelEdit();
  }
};

// 处理鼠标按下事件
// const handleMouseDown = (index, event) => {
//   console.log('handleMouseDown1111');
//   // if (recording.value || editingIndex.value !== null) return;
//   if (editingIndex.value !== null) return;

//   const clickedElement = event.target.closest('[data-key="del"]');
//   if (clickedElement) {
//     const keystrokeItem = clickedElement.closest('.keystroke-item');
//     if (keystrokeItem) {
//       const index = parseInt(keystrokeItem.getAttribute('data-index'), 10);
//       if (!Number.isNaN(index)) {
//         delMacroKey(index);
//         return;
//       }
//     }
//   }

//   mouseDownTime.value = Date.now();
//   document.addEventListener('mouseup', handleMouseUp);
// };

const handleMouseUp = (event) => {
  console.log('handleMouseUp1111');
  document.removeEventListener('mouseup', handleMouseUp);

  if (!isDragging.value && Date.now() - mouseDownTime.value < 200) {
    const clickedElement = event.target.closest('.keystroke-card');
    if (clickedElement) {
      const dataId = clickedElement.closest('.keystroke-item').getAttribute('data-index');
      const index = dataId ? parseInt(dataId, 10) : -1;

      if (index !== -1) {
        startEditing(index);
      }
    }
  }

  isDragging.value = false;
};

const editMacroKey = (index) => {
  startEditing(index);
};

// 拖拽功能
const dragStart = (index, event) => {
  if (editingIndex.value !== null) {
    event.preventDefault();
    return;
  }

  isDragging.value = true;
  draggedItem.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());
};

const dragEnter = (index, event) => {
  if (draggedItem.value === null || draggedItem.value === index) return;
  event.preventDefault();
  dragOverIndex.value = index;
};

const dragLeave = (index, event) => {
  if (dragOverIndex.value !== index) return;
  const { relatedTarget } = event;
  const isLeavingToAnotherDragItem = relatedTarget && relatedTarget.closest('.keystroke-item');

  if (!isLeavingToAnotherDragItem) {
    setTimeout(() => {
      if (dragOverIndex.value === index) {
        dragOverIndex.value = null;
      }
    }, 50);
  }
};

const dragOver = (index, event) => {
  if (draggedItem.value === null || index === draggedItem.value) {
    event.preventDefault();
    return;
  }
  event.preventDefault();
  dragOverIndex.value = index;
};

const dragEnd = () => {
  draggedItem.value = null;
  dragOverIndex.value = null;
  cancelEdit();
};

const drop = (index, event) => {
  if (draggedItem.value === null || editingIndex.value !== null) return;

  event.preventDefault();
  const fromIndex = draggedItem.value;
  const toIndex = dragOverIndex.value !== null ? dragOverIndex.value : index;

  if (fromIndex !== toIndex) {
    const itemToMove = JSON.parse(JSON.stringify(macros.value.data[fromIndex]));
    const newRecords = [...macros.value.data];
    newRecords.splice(fromIndex, 1);
    newRecords.splice(toIndex, 0, itemToMove);
    macros.value.data = newRecords;
  }

  dragEnd();
};

// 编辑功能
const startEditing = (index) => {
  // if (recording.value) return;

  const record = macros.value.data[index];

  editingIndex.value = index;
  editingKeyCode.value = record.keyCode;
  editingKey.value = record.keyCode ? keyboardMap[record.keyCode]?.name || '' : '';
  editingDirection.value = record.status;
  editingTime.value = record.delay;
};

const cancelEdit = () => {
  // 如果是新增状态，需要删除新插入的空记录
  if (isAdding.value) {
    macros.value.data.splice(editingIndex.value, 1);
  }
  editingIndex.value = null;
  isAdding.value = false;
  if (!recording.value) {
    emit('confirm', macros.value.data);
  }
};

const handleKeyInput = (event) => {
  const { key, keyCode, code } = event;
  // 特殊按键映射
  const specialKeyMap = {
    Home: 74,
    Escape: 41,
    Tab: 43,
    Space: 44,
    CapsLock: 57,
    AltLeft: 226,
    AltRight: 230,
    ControlLeft: 224,
    ControlRight: 228,
    ShiftLeft: 225,
    ShiftRight: 229,
    ArrowUp: 82,
    ArrowDown: 81,
    ArrowLeft: 80,
    ArrowRight: 79,
    PageUp: 75,
    PageDown: 78,
  };

  // 如果是特殊按键，使用映射值
  if (specialKeyMap[code]) {
    editingKey.value = keyboardMap[specialKeyMap[code]]?.name || '';
    inputKeyCode.value = keyCode;
    inputCode.value = code;
  }
  // 如果是普通字符
  else if (key.length === 1 || key === 'Backspace' || key === 'Delete' || key === 'Enter') {
    editingKey.value = key.toUpperCase();
    inputKeyCode.value = keyCode;
    inputCode.value = code;
  }

  if (key === 'Enter') {
    event.preventDefault();
  }
};

const saveEdit = () => {
  if (editingIndex.value === null) return;
  if (!editingKey.value || editingTime.value < 0) {
    MessagePlugin.error(t('messages.macroCompleteKeyInfo'));
    return;
  }
  if (editingTime.value > 32768) {
    MessagePlugin.error(t('messages.macroTimeMaxError'));
    return;
  }
  if (editingTime.value < 1) {
    MessagePlugin.error(t('messages.macroTimeMinError'));
    return;
  }
  let keyValue: any = keyValueDictionary[inputKeyCode.value];
  // 使用 keyValueDictionary 转换 keyCode
  if (!inputKeyCode.value) {
    keyValue = editingKeyCode.value;
  }

  editingKeyCode.value = '';

  const specialKeys = [
    [16, 'ShiftRight', 500],
    [17, 'ControlRight', 501],
    [18, 'AltRight', 502],
  ];
  const [_keyCode, _code, dictKey] =
    specialKeys.find(([k, c]) => inputKeyCode.value === k && inputCode.value === c) || [];
  if (dictKey) keyValue = keyValueDictionary[dictKey];
  // 使用转换后的 keyValue 在 keyboards 中查找对应的键名
  const finalKeyCode = parseInt(keyValue, 10);

  macros.value.data[editingIndex.value] = {
    ...macros.value.data[editingIndex.value],
    keyCode: finalKeyCode,
    status: editingDirection.value,
    delay: editingTime.value,
  };

  isAdding.value = false;
  cancelEdit();
};

// 监听recording变化
watch(recording, (val) => {
  emitter.emit('isRecording', val);
  if (val) {
    configStore.setActiveMenuAndDisableOthers('macro');
  } else {
    configStore.setAllEnabledMenu();
  }
});

// 生命周期钩子
onMounted(() => {
  window.addEventListener('keydown', handleKeyDownAndUp);
  window.addEventListener('keyup', handleKeyDownAndUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDownAndUp);
  window.removeEventListener('keyup', handleKeyDownAndUp);
  document.removeEventListener('mouseup', handleMouseUp);
  configStore.setAllEnabledMenu();
});

const isComposing = ref(false);

const handleInput = (_event) => {
  if (!isComposing.value) {
    editingKey.value = editingKey.value.slice(0, 1);
  }
};

const onCompositionEnd = (_event) => {
  isComposing.value = false;
  editingKey.value = editingKey.value.slice(0, 1);
};
</script>

<style lang="less" scoped>
@import './styles/MacroData.less';
</style>
