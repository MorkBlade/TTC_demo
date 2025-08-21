import { useKeyboardStore } from '@/store';

const keyboardStore = useKeyboardStore();

const useSetAdvanced = () => {
  const advancedItems = computed(() => {
    const value = [];
    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');
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
    // console.log('advancedItems', value);
    return value;
  });

  return {
    advancedItems,
  };
};

export default useSetAdvanced;
