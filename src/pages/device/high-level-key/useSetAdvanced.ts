import { MessagePlugin } from 'tdesign-vue-next';
import { useHigherKeyStore, useKeyboardStore } from '@/store';
import { t } from '@/locales';

const useSetAdvanced = () => {
  const highLevelKeyStore = useHigherKeyStore();
  const keyboardStore = useKeyboardStore();
  const childRef = useTemplateRef<any>('childRef');

  const minTouchTravel = ref(0);
  const maxTouchTravel = ref(10);
  const precision = ref(0);

  const selectedKeyType = ref(null);
  const selectedCenterItem = reactive({
    value: null,
  });
  const selectedCenterKeyId = ref(null);
  // dksInfo
  const dksInfo = reactive({ dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.4, db2: 3.0 });
  // mptInfo
  const mptInfo = reactive({ dks: [0, 0, 0], dbs: [0.5, 1.0, 1.5] });
  // mtInfo
  const mtInfo = reactive({ dks: [0, 0], delay: 200 });
  // tglInfo
  const tglInfo = reactive({ kc: 0, delay: 200 });
  // endInfo
  const endInfo = reactive({ dks: [0, 0], delay: 200 });
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
  // rsInfo
  const rsInfo = reactive({ kcs: [0, 0], delay: 0 });

  const edit = ref(false);
  const editKey = ref(0);

  const handleItemClick = (item) => {
    selectedCenterItem.value = item;
    selectedCenterKeyId.value = item.keyId;

    // TODO:这里的type都是小写后面要改为大写
    selectedKeyType.value = item.type.toUpperCase();
    edit.value = true;
    editKey.value = item.keyValue;
    // 解析
    if (item.type === 'socd') {
      const { key1, key2, pos1, pos2, type, mode } = item.socd;
      socdInfo.kcs = [key1, key2];
      socdInfo.pos = [pos1, pos2];
      socdInfo.type = type;
      socdInfo.mode = mode;
    } else if (item.type === 'dks') {
      const { dks, trps, db, db2 } = item;
      const { dks1, dks2, dks3, dks4 } = dks;
      dksInfo.dks = [dks1, dks2, dks3, dks4];
      dksInfo.trps = [trps.trps1, trps.trps2, trps.trps3, trps.trps4];
      dksInfo.db = db;
      dksInfo.db2 = db2;
    } else if (item.type === 'mt') {
      const { mt } = item;
      const { dksAll, delay } = mt;
      mtInfo.dks = [dksAll.dks1, dksAll.dks2];
      mtInfo.delay = delay;
    }
  };

  const handleKeyTypeChange = (type) => {
    // 初始化调用的
    if (type === selectedKeyType.value) {
      selectedKeyType.value = '';
      return;
    }
    if (type !== 'SOCD' && activeKeys.value.length === 0) {
      return;
    }

    // 编辑的时候会覆盖值
    if (type === 'mt') {
      Object.assign(mtInfo, { dks: [0, 0], delay: 200 });
    } else if (type === 'dks') {
      Object.assign(dksInfo, { dks: [0, 0, 0, 0], trps: [0, 0, 0, 0], db: 1.5, db2: 3.0 });
    } else if (type === 'socd') {
      Object.assign(socdInfo, { pos: [0, 0], kcs: [0, 0], type: 0, mode: 0, delay: 0 });
    } else if (type === 'rs') {
      Object.assign(rsInfo, { kcs: [0, 0], delay: 0 });
    } else if (type === 'mpt') {
      Object.assign(mptInfo, { dks: [0, 0, 0], dbs: [0.5, 1.0, 1.5] });
    } else if (type === 'end') {
      Object.assign(endInfo, { dks: [0, 0], delay: 200 });
    } else if (type === 'tgl') {
      Object.assign(tglInfo, { kc: 0, delay: 200 });
    }

    // 打开弹窗
    edit.value = false;
    editKey.value = 0;
    selectedKeyType.value = type;
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

  const resetKeys = async () => {
    await highLevelKeyStore.getHighLevelKeys(keyboardStore.keyboardLayout);
  };

  onMounted(async () => {
    // if (highLevelKeyStore.highLevelKeysData.length === 0) {
    await resetKeys();
    // }
  });

  // 计算当前选择的高级键
  const activeKeys = computed(() => {
    return keyboardStore.activeKeys;
  });

  return {
    childRef,
    edit,
    editKey,
    socdInfo,
    dksInfo,
    mtInfo,
    rsInfo,
    mptInfo,
    tglInfo,
    endInfo,
    maxTouchTravel,
    minTouchTravel,
    precision,
    handleKeyTypeChange,
    handleDialoConfirm,
    handleItemClick,
  };
};

export default useSetAdvanced;
