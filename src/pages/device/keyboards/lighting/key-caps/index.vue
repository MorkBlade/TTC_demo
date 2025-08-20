<template>
  <div
    class="key"
    :data-row="row"
    :data-col="col"
    @mousedown="startMouseDown"
    @mouseenter="handleMouseOver"
    @mouseup="startMouseUp"
    @contextmenu="handleContextmenu"
  >
    <div
      v-if="keyCap2.width !== '0px'"
      v-px2rem="{
        styles: () => ({ ...keyCap2 }),
      }"
      class="key-cap"
      :style="{ backgroundColor: keyColor.isCustom ? keyColor.color : 'var(--key-color)' }"
    ></div>
    <div
      v-px2rem="{
        styles: () => ({ ...keyCap }),
      }"
      class="key-cap"
      :style="{ backgroundColor: keyColor.isCustom ? keyColor.color : 'var(--key-color)' }"
    >
      <!-- 灯光的 -->
    </div>

    <div
      v-if="keyCap2.width !== '0px'"
      v-px2rem="{ styles: () => ({ ...keyCap2Cover }) }"
      class="key-cap-cover"
      :style="{ '--key-bg-color': keyColor.isCustom ? keyColor.color : 'var(--key-color)' }"
    ></div>
    <div
      v-if="keyColor.isCustom"
      v-px2rem="{
        styles: () => ({ ...keyCap }),
      }"
    >
      <div
        v-px2rem="{
          styles: () => ({ width: '100%', height: '12px', lineHeight: 1, textAlign: 'right' }),
        }"
        class="key-color-custom"
      >
        <t-icon name="edit" size="12" :color="keyColor.fontColor" />
      </div>
    </div>
    <div
      v-px2rem="{
        styles: () => ({ ...keyLabels }),
      }"
      :style="{ color: keyColor.fontColor }"
      class="key-labels"
    >
      <template v-if="isIcon">
        <img
          v-if="svgPath"
          :src="svgPath"
          class="key-icon"
          :style="{
            filter: keyColor.isCustom
              ? `brightness(0) saturate(100%) invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(50%) contrast(200%)`
              : '',
          }"
        />
        <span v-else>{{ keyCode }}</span>
      </template>
      <template v-else>
        {{ keyCode }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Key' });

import { ref, watch } from 'vue';
import { useStyleKeyCapsHook } from './hooks/useStyleKeyCapsHook';
import { useMouseHook } from './hooks/useMouseHook';
import { ICON_MAP } from '@/config/constant/index';

const props = defineProps({
  shapeScale: { type: Object, default: () => ({ w: 1, h: 1 }) },
  location: { type: Object, default: () => ({ row: 0, col: 0 }) },
  active: { type: Boolean, default: false },
  row: { type: Number, default: 0 },
  col: { type: Number, default: 0 },
  layoutRowIndex: { type: Number, default: 0 },
  layoutColIndex: { type: Number, default: 0 },
});
const { shapeScale, location, row, col, layoutRowIndex, layoutColIndex } = props;
const { keyCap, keyLabels, keyCode, keyColor, isIcon, keyCap2, keyCap2Cover } = useStyleKeyCapsHook(
  row,
  col,
  { layoutRowIndex, layoutColIndex },
  { shapeScale, location },
);
const svgPath = ref('');
watch(
  [keyCode, isIcon],
  ([newCode, isIconValue]) => {
    if (newCode && isIconValue) {
      // svgPath.value = `/src/assets/images/${newCode}.svg`;
      svgPath.value = ICON_MAP[newCode];
    } else {
      svgPath.value = '';
    }
  },
  { immediate: true },
);

const { startMouseDown, startMouseUp, handleMouseOver, handleContextmenu } = useMouseHook(row, col);
</script>

<style lang="less" scoped>
@import './index.less';

.key-icon {
  width: 25px;
  height: 25px;
  color: #fff;
  filter: brightness(0) saturate(100%) invert(1) sepia(0) saturate(0) hue-rotate(0deg) brightness(50%) contrast(200%);
}
</style>
