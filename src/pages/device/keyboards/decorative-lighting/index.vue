<template>
  <div class="device-logo-lighting">
    <div
      v-px2rem="{
        styles: () => ({
          width: `${containerDimensions.width}px`,
          height: `${Number(containerDimensions.height) - 20}px`,
          display: 'flex',
        }),
      }"
      class="device-logo-lighting-container grab"
    >
      <template v-if="isLoading">
        <div class="loading-placeholder">{{ t('messages.loadingData') }}</div>
      </template>
      <template v-else-if="getCurrentArea.rows > 0 && getCurrentArea.cols > 0">
        <template v-for="(row, rowIndex) in getCurrentArea.rows" :key="row">
          <template v-for="(col, colIndex) in getCurrentArea.cols" :key="`${row}-${col}`">
            <div
              v-px2rem="{
                styles: () => ({
                  width: '20px',
                  height: '20px',
                  border: '1px solid #ffff',
                  borderRadius: '5px',
                }),
              }"
              class="lighting-logo"
              :style="{ backgroundColor: keyColor(rowIndex, colIndex).color }"
              @mousedown="(e) => startMouseDown(e, rowIndex, colIndex)"
              @mouseenter="handleMouseOver(rowIndex, colIndex)"
              @mouseup="startMouseUp"
              @contextmenu="(e) => handleContextmenu(e)"
              @dragenter="(e) => e.preventDefault()"
              @dragover="(e) => e.preventDefault()"
            >
              <div
                v-if="keyColor(rowIndex, colIndex).isCustom"
                v-px2rem="{
                  styles: () => ({ width: '100%', height: '12px', lineHeight: '1', textAlign: 'right' }),
                }"
                class="key-color-custom"
              >
                <t-icon
                  name="edit"
                  size="12"
                  :color="keyColor(rowIndex, colIndex).fontColor"
                  style="margin-top: -5px"
                />
              </div>
            </div>
          </template>
        </template>
      </template>
      <div class="tip">
        <p><t-icon name="mouse" size="14" style="margin-right: 2px" />{{ t('messages.lightingDecorTip') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeviceKeyboardDecorativeLighting' });

import { useGlobalStore, useKeyboardStore, useLightingStore } from '@/store';
import type { Color, Area, KeyColorResult } from '@/types/keyboard';
import { useKeyboardStyle } from '../hooks/useKeyboardStyle';
import { t } from '@/locales';

const keyboardStore = useKeyboardStore();
const globalStore = useGlobalStore();
const lightingStore = useLightingStore();

const isLoading = ref(true);

const { containerDimensions } = useKeyboardStyle();

onMounted(async (): Promise<void> => {
  try {
    // await globalStore.getLightingArea();
    // await keyboardStore.getKeyLayoutStyle();
  } catch (error) {
    console.error('初始化数据失败:', error);
  } finally {
    isLoading.value = false;
  }
});

const getCurrentArea = computed<Area>(() => {
  if (!globalStore.lightingArea || !Array.isArray(globalStore.lightingArea) || globalStore.lightingArea.length === 0) {
    return { rows: 0, cols: 0 };
  }
  const data = globalStore.lightingArea[lightingStore.lightingAreaIndex];
  if (data && typeof data.rows === 'number' && typeof data.cols === 'number') {
    return { rows: data.rows, cols: data.cols };
  }
  return { rows: 0, cols: 0 };
});

const keyColor = computed(() => {
  return (rowIndex: number, colIndex: number): KeyColorResult => {
    if (lightingStore.lightingDecorate[rowIndex]) {
      const { R, G, B, isCustom } = lightingStore.lightingDecorate[rowIndex][colIndex] || {
        R: 100,
        G: 100,
        B: 255,
        isCustom: false,
      };
      const brightness = (R * 299 + G * 587 + B * 114) / 1000;
      const fontColor = brightness > 128 ? '#000000' : '#FFFFFF';
      return { color: `rgba(${R},${G},${B},1)`, isCustom, brightness, fontColor };
    }
    // 这里判断一下自定义按钮颜色
    const { R, G, B, isCustom } = { R: 100, G: 100, B: 255, isCustom: false };
    const brightness = (R * 299 + G * 587 + B * 114) / 1000;
    const fontColor = brightness > 128 ? '#000000' : '#FFFFFF';
    return {
      color: `rgba(${R},${G},${B},1)`,
      isCustom,
      brightness,
      fontColor,
    };
  };
});

const startMouseDown = (e: MouseEvent, rowIndex: number, colIndex: number) => {
  e.preventDefault();
  keyboardStore.inChangLight = true;
  if (e.button === 0) {
    changeKeyLightColor(rowIndex, colIndex);
  }
  // 如果当前键位是右键
  if (e.button === 2) {
    lightingStore.contextMenuVisible = true;
    changeKeyLightColor(rowIndex, colIndex, false);
  }
};

const handleMouseOver = async (rowIndex: number, colIndex: number) => {
  if (keyboardStore.inChangLight) {
    if (lightingStore.contextMenuVisible) {
      changeKeyLightColor(rowIndex, colIndex, false);
    } else {
      changeKeyLightColor(rowIndex, colIndex);
    }
  }
};

const startMouseUp = (e: MouseEvent) => {
  keyboardStore.inChangLight = false;
  if (e.button === 2) {
    lightingStore.contextMenuVisible = false;
  }
};

const changeKeyLightColor = async (rowIndex: number, colIndex: number, isCustom = true) => {
  let color: Color;
  if (!isCustom) {
    // 取消自定义时，使用默认颜色而不是黑色，避免闪烁
    color = { R: 100, G: 100, B: 255 };
  } else {
    color = lightingStore.colorPickerPanel;
  }
  // console.log('setDecorateColor0000', rowIndex, colIndex, color, isCustom);
  lightingStore.setDecorateColor(rowIndex, colIndex, color, isCustom);
};

const handleContextmenu = (e: MouseEvent) => {
  e.preventDefault();
};
</script>

<style scoped lang="less">
.device-logo-lighting {
  display: flex;
  justify-content: center;
}

.device-logo-lighting-container {
  flex-wrap: wrap;
  align-content: flex-start;
  position: relative;
  box-sizing: border-box;
  margin: 40px;
  padding: 20px;
  background: rgb(46 48 51 / 50%);
  border-radius: 10px;
  box-shadow: 12px 20px 12px rgb(0 0 0 / 25%);
}

.lighting-logo {
  color: #fff;
  width: 40px !important;
  height: 40px !important;
  margin-left: 0 !important;
  margin-bottom: 10px;
  margin-right: 5px;
}

.lighting-logo + .lighting-logo {
  margin-left: 20px;
}

.grabbing {
  cursor: grabbing !important;
}

.grab {
  cursor: grab !important;
}

.tip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -30px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  // padding: 8px 0 12px 0;
  // border-radius: 0 0 10px 10px;
  pointer-events: none;

  /* 定义关键帧动画 */
  p {
    color: #fff;
    font-size: 12px;
    margin: 0;
    letter-spacing: 2px;
  }
}
</style>
