import { useKeyboardStore } from '@/store';

const keyboardStore = useKeyboardStore();

const useSetAdvanced = () => {
  const childRef: Ref<{ reset: () => void }> = useTemplateRef('childRef');

  // 获取所有高级键
  const advancedItems = computed(() => {
    const value = [];
    // if (hasAdvancedData.value) {
    const keyboards = keyboardStore.keyboardLayout;
    if (Array.isArray(keyboards)) {
      keyboards.forEach((row, rowIdx) => {
        if (Array.isArray(row)) {
          row.forEach((col, colIdx) => {
            if (
              col &&
              col.advancedKeys &&
              col.advancedKeys.advancedType !== 0 &&
              col.advancedKeys.advancedType !== null &&
              col.advancedKeys.advancedType !== ''
            ) {
              // console.log('current key is advanced:>>>>>>>>>>', col);
              // 只收集advancedKeys下不为null的属性
              const { advancedKeys } = col;
              const filtered = {};
              Object.keys(advancedKeys).forEach((k) => {
                if (advancedKeys[k] !== null) {
                  filtered[k] = advancedKeys[k];
                }
              });
              value.push({
                row: rowIdx,
                col: colIdx,
                keyValue: col.keyValue,
                ...filtered,
              });
            }
          });
        }
      });
    }
    // }
    return value;
  });

  // 重置默认值
  const resetDefaultValue = () => {
    if (childRef?.value && typeof childRef.value.reset === 'function') {
      childRef.value.reset();
    }
  };

  return {
    advancedItems,
    resetDefaultValue,
  };
};

export default useSetAdvanced;
