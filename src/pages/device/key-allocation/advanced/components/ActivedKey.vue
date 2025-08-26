<template>
  <div class="actived-key">
    <div ref="addNewRef" class="add-new" @click="addNew">
      <div class="add-new-title">+ 新建高级键</div>
      <div v-if="isShowAddMenu" class="add-menu" ref="addMenuRef">
        <div v-for="item in addMenuItems" :key="item.title" class="add-menu-item" @click="toAdd(item.value)">
          <div class="title">{{ item.title }}</div>
          <div class="desc">{{ item.desc }}</div>
        </div>
      </div>
    </div>
    <div v-for="(item, index) in advancedData" :key="index" class="actived-key-item">
      <template v-if="TYPE_MAPPING[item.advancedType] === 'socd' && item.socd">
        <div class="advanced-name">SO<br />CD</div>
        <div class="content">
          <div class="title">{{ keyboardMap[item.keyValue].name }}</div>
          <div class="desc">
            {{
              '优先设定(' +
              keyboardMap[item.socd.socd.kcs[1]].name +
              '+' +
              keyboardMap[item.socd.socd.kcs[0]].name +
              ')'
            }}
          </div>
        </div>
      </template>
      <template v-if="TYPE_MAPPING[item.advancedType] === 'dks' && item.dks">
        <div class="advanced-name">DKS</div>
        <div class="content">
          <div class="title">{{ keyboardMap[item.keyValue].name }}</div>
          <div class="desc">
            {{
              '动态键程(' +
              keyboardMap[item.dks.dks[0]].name +
              '+' +
              keyboardMap[item.dks.dks[1]].name +
              '+' +
              keyboardMap[item.dks.dks[2]].name +
              '+' +
              keyboardMap[item.dks.dks[3]].name +
              ')'
            }}
          </div>
        </div>
      </template>
      <template v-if="TYPE_MAPPING[item.advancedType] === 'mpt' && item.mpt">
        <div class="advanced-name">MPT</div>
        <div class="content">
          <div class="title">{{ keyboardMap[item.keyValue].name }}</div>
          <div class="desc">
            {{
              '多点触发(' +
              keyboardMap[item.mpt.dks[0]].name +
              '+' +
              keyboardMap[item.mpt.dks[1]].name +
              '+' +
              keyboardMap[item.mpt.dks[2]].name +
              ')'
            }}
          </div>
        </div>
      </template>
      <template v-if="TYPE_MAPPING[item.advancedType] === 'tgl' && item.tgl">
        <div class="advanced-name">TGL</div>
        <div class="content">
          <div class="title">{{ keyboardMap[item.keyValue].name }}</div>
          <div class="desc">
            {{ '切换开关(' + keyboardMap[item.tgl.tgl?.kc].name + ')' }}
          </div>
        </div>
      </template>
      <template v-if="TYPE_MAPPING[item.advancedType] === 'mt' && item.mt">
        <div class="advanced-name">MT</div>
        <div class="content">
          <div class="title">{{ keyboardMap[item.keyValue].name }}</div>
          <div class="desc">
            {{
              '双效点击(' +
              keyboardMap[item.mt.mt?.dksAll?.[0]].name +
              '+' +
              keyboardMap[item.mt.mt?.dksAll?.[1]].name +
              ')'
            }}
          </div>
        </div>
      </template>
      <template v-if="TYPE_MAPPING[item.advancedType] === 'end' && item.end">
        <div class="advanced-name">END</div>
        <div class="content">
          <div class="title">{{ keyboardMap[item.keyValue].name }}</div>
          <div class="desc">
            {{
              '松开触发(' + keyboardMap[item.end.end?.dks[0]].name + '+' + keyboardMap[item.end.end?.dks[1]].name + ')'
            }}
          </div>
        </div>
      </template>

      <div class="edit-icon">
        <custom-dropdown :options="options" trigger="click" @click="(option) => clickHandler(option, item)">
          <button class="edit-button"></button>
        </custom-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { keyboardMap } from '@/config/byte-to-key/keyboard-map';
import CustomDropdown from '@/components/CustomDropdown.vue';

// const { advancedItems } = useSetAdvanced();
const emit = defineEmits(['toAdd', 'edit']);
const { advancedData } = defineProps({
  title: {
    type: String,
  },
  advancedData: {
    type: Array as PropType<any[]>,
  },
  addMenuItems: {
    type: Array as PropType<any[]>,
  },
});

const options: Array<{
  content: string;
  value: number;
  theme?: any;
  disabled?: boolean;
}> = [
  {
    content: '编辑',
    value: 1,
    disabled: true,
  },
  {
    content: '重命名',
    value: 2,
    disabled: true,
  },
  {
    content: '删除',
    value: 3,
    theme: 'error',
    disabled: false,
  },
];

const TYPE_MAPPING = {
  1: 'dks',
  2: 'mpt',
  3: 'mt',
  4: 'tgl',
  5: 'end',
  6: 'socd',
  7: 'rs',
  8: 'socd',
  9: 'rs',
};

const isShowAddMenu = ref(false);
const addNewRef = ref(null);
const addMenuRef = ref(null);

const clickHandler = (option, item) => {
  emit('edit', { option, item });
};

const addNew = () => {
  isShowAddMenu.value = true;
};

const toAdd = (value: string) => {
  emit('toAdd', value);
  isShowAddMenu.value = false; // 选择后关闭菜单
};

// 点击外部区域关闭菜单
const handleClickOutside = (event: Event) => {
  if (!isShowAddMenu.value) return;

  const target = event.target as Node;
  const addNewElement = addNewRef.value as HTMLElement;
  const addMenuElement = addMenuRef.value as HTMLElement;

  // 如果点击的不是按钮本身和菜单区域，则关闭菜单
  if (addNewElement && !addNewElement.contains(target) && addMenuElement && !addMenuElement.contains(target)) {
    isShowAddMenu.value = false;
  }
};

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="less">
.actived-key {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 28px;
  overflow: visible; /* 确保子元素的菜单不被裁剪 */
  .add-new,
  .actived-key-item {
    position: relative;
    width: 260px;
    height: 60px;
    background-image: url('@/assets/images/advancedKeyBottomFrame.svg');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    overflow: visible; /* 确保菜单不被裁剪 */
    &:hover {
      color: #0de7c4;
      background-image: url('@/assets/images/advancedKeyBottomFrame_hover.svg');
    }
  }
  .actived-key-item {
    display: flex;
    padding: 10px;
    .advanced-name {
      width: 40px;
      height: 40px;
      border: 2px solid #616161;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      text-align: center;
      // padding: 5px;
      // font-size: 14px;
      // letter-spacing: 2px;
      word-break: break-all;
      overflow-wrap: break-word;
      line-height: 16px;
    }
    .content {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 10px;
      .desc {
        color: #8b8b8b;
      }
    }
    .edit-icon {
      width: 24px;
      height: 24px;
      margin-right: 6px;
      cursor: pointer;
      background-image: url('@/assets/images/....svg');
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;
      .edit-button {
        min-width: unset;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        background: transparent;
        color: #fff;
        cursor: pointer;
        font-size: 16px;

        &:hover {
          background: transparent;
          color: #0de7c4;
        }
      }
    }
  }
}
.add-menu {
  position: absolute;
  z-index: 9999;
  bottom: 80px;
  left: 0;
  width: 330px;
  max-height: 335px;
  background-color: #383838;
  border: 1px solid #616161;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow-y: auto;

  .add-menu-item {
    width: 100%;
    min-height: 80px;
    padding: 15px 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: background-color 0.2s ease;
    overflow: hidden;

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .desc {
      font-size: 14px;
      line-height: 1.4;
      color: #999999;
    }

    &:hover {
      background-color: #525252;
    }

    &:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 3px;
    // 设置滚动条距离右侧边距,避免圆角溢出
    margin-right: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #383838;
    // 设置轨道距离右侧边距,避免圆角溢出
    margin-right: 8px;
    border-radius: 3px;
  }
}
</style>
