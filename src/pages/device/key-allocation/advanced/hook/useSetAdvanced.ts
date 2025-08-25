import { useKeyboardStore } from '@/store';
import { t } from '@/locales';

const keyboardStore = useKeyboardStore();

const useSetAdvanced = () => {
  const childRef = useTemplateRef<any>('childRef');
  // socdInfo
  const socdInfo = reactive({
    pos: [
      { row: 0, col: 0 },
      { row: 0, col: 0 },
    ],
    kcs: [0, 0],
    type: 0,
    mode: 0,
    delay: 0,
  });
  // dksInfo
  const dksInfo = reactive({ dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.4, db2: 3.0 });
  // mtInfo
  const mtInfo = reactive({ dks: [0, 0], delay: 200 });
  // rsInfo
  const rsInfo = reactive({ kcs: [0, 0], delay: 0 });
  // mptInfo
  const mptInfo = reactive({ dks: [0, 0, 0], dbs: [0.5, 1.0, 1.5] });
  // tglInfo
  const tglInfo = reactive({ kc: 0, delay: 200 });
  // endInfo
  const endInfo = reactive({ dks: [0, 0], delay: 200 });
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

  const handleDialoConfirm = async () => {
    try {
      const res = await childRef.value?.save();
      if (res === 'twoKeys') {
        MessagePlugin.error(t('messages.setAdvancedSelectTwoKeys'));
        return;
      }
      if (res === 'atLeastOneKey') {
        MessagePlugin.error(t('messages.setAdvancedSelectAtLeastOneKey'));
        return;
      }
      MessagePlugin.success(t('messages.setAdvancedSaveSuccess'));
    } catch (error) {
      console.log(error);
    }
  };

  return {
    childRef,
    socdInfo,
    dksInfo,
    mtInfo,
    rsInfo,
    mptInfo,
    tglInfo,
    endInfo,
    advancedItems,
    resetDefaultValue,
    handleDialoConfirm,
  };
};

export default useSetAdvanced;
