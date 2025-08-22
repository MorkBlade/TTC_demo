<template>
  <div class="custom-dropdown" ref="dropdownRef">
    <div class="dropdown-trigger" @click="toggleDropdown">
      <slot>
        <button class="default-trigger">⋯</button>
      </slot>
    </div>
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu" :style="menuStyle">
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-item"
          :class="{
            'error-theme': option.theme === 'error',
            disabled: option.disabled,
          }"
          @click="handleItemClick(option)"
        >
          {{ option.content }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

interface DropdownOption {
  content: string;
  value: number;
  theme?: string;
  disabled?: boolean;
}

interface Props {
  options: DropdownOption[];
  trigger?: 'click' | 'hover';
}

interface Emits {
  (e: 'click', data: DropdownOption): void;
}

const props = withDefaults(defineProps<Props>(), {
  trigger: 'click',
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement>();
const menuStyle = ref({});

const toggleDropdown = () => {
  if (props.trigger === 'click') {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      nextTick(() => {
        calculateMenuPosition();
      });
    }
  }
};

const handleItemClick = (option: DropdownOption) => {
  // 如果选项被禁用，则不执行任何操作
  if (option.disabled) {
    return;
  }

  emit('click', option);
  isOpen.value = false;
};

const calculateMenuPosition = () => {
  if (!dropdownRef.value) return;

  const rect = dropdownRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const menuHeight = 120; // 估算菜单高度

  // 判断是否需要向上展开
  if (rect.bottom + menuHeight > viewportHeight && rect.top > menuHeight) {
    menuStyle.value = {
      bottom: '100%',
      marginBottom: '4px',
    };
  } else {
    menuStyle.value = {
      top: '100%',
      marginTop: '4px',
    };
  }
};

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="less">
.custom-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
}

.default-trigger {
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

.dropdown-menu {
  position: absolute;
  left: 0;
  min-width: 72px;
  background: #383838;
  border: 1px solid #616161;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover:not(.disabled) {
    background-color: #525252;
  }

  &.error-theme {
    color: #ff4757;

    &:hover:not(.disabled) {
      background-color: rgba(255, 71, 87, 0.1);
    }
  }

  &.disabled {
    color: #666;
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      background-color: transparent;
      color: #666;
    }
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
