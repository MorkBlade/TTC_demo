<template>
  <div class="advanced-character">
    <div v-px2rem="{ styles: () => ({ height: characterCardHeight + 'px' }) }" class="normal-character">
      <div class="title" @click="spreadCard">
        <span>{{ title }}</span>
        <icon-font
          v-px2rem="{ styles: () => ({ transform: `rotate(${iconRoate}deg)` }) }"
          name="chevron-down"
          size="21px"
        />
      </div>
      <div class="character">
        <div>
          <key
            v-for="item in characters"
            :key="Number(item)"
            size="small"
            :active="selectKey === item"
            :key-value="Number(item)"
          >
          </key>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconFont } from 'tdesign-icons-vue-next';

import { useKeyboardStore } from '@/store';
import Key from './key.vue';
import { t } from '@/locales';

const { characters, title } = defineProps({
  characters: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: () => t('messages.highKeyCharBasic'),
  },
});

const keyboardStore = useKeyboardStore();

const iconRoate = ref(0);
const characterCardHeight = ref(55);

const selectKey = computed(() => keyboardStore.selectKey);

const spreadCard = () => {
  characterCardHeight.value = characterCardHeight.value === 378 ? 55 : 378;
  iconRoate.value = iconRoate.value === 0 ? 180 : 0;
};
</script>

<style scoped lang="less">
.advanced-character {
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  // width: 720px;
  // height: 378px;
  // padding-right: 28px;
  // padding-left: 23px;

  // &::before {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   box-sizing: border-box;
  //   width: 706px;
  //   height: 378px;
  //   border: 1px solid rgb(112 112 112 / 100%);
  //   border-radius: 18px;
  //   content: '';
  // }

  & .normal-character {
    width: 706px;
    height: 378px;
    margin-bottom: 12px;
    box-sizing: border-box;
    // padding-right: 28px;
    border-radius: 18px;
    border: 1px solid rgb(112 112 112 / 100%);
    padding-left: 23px;
    overflow: hidden;
    transition: height 0.2s ease-in-out;
    position: relative;
    z-index: 10;

    & .title {
      padding-top: 16px;
      padding-bottom: 23px;
      padding-right: 16px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      position: relative;
      z-index: 10;

      span {
        color: rgb(255 255 255 / 100%);
        font-weight: 700;
        font-size: 16px;
        letter-spacing: 0;
        text-align: center;
      }

      i {
        display: inline-block;
        width: 21px;
        // height: 8px;
        color: rgb(255 255 255 / 100%);
        transition: transform 0.2s ease-in-out;
      }
    }

    & .character {
      position: relative;
      z-index: 10;
      width: 99%;
      height: 294px;
      padding-right: 29px;
      overflow-y: scroll;

      /* 滚动条整体样式 */
      &::-webkit-scrollbar {
        width: 5px;
        height: 10px;
      }

      /* 滚动条轨道 */
      &::-webkit-scrollbar-track {
        background: rgb(41 42 46 / 100%);
        border-radius: 20px;
      }

      /* 滚动条手柄 */
      &::-webkit-scrollbar-thumb {
        background: rgb(204 204 204 / 100%);
        border-radius: 20px;
      }

      /* 隐藏滚动条 */
      &::-webkit-scrollbar {
        display: none;
      }

      /* 当容器被悬停时显示滚动条 */
      &:hover::-webkit-scrollbar {
        display: block;
      }

      > div {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
