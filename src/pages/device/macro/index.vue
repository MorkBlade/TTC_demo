<template>
  <div class="device-macro">
    <div class="device-macro__list">
      <h4>{{ t('messages.macroList') }}</h4>
      <div class="macro_item">
        <macroKey
          v-for="(item, idx) in keyboardMapByType.macro"
          :key="item"
          :active="curMacroIdx === idx"
          :key-index="idx"
          :key-value="item"
          :macro-length="macroDataLength(idx)"
          @choose-macro="chooseMacro"
        />
      </div>
    </div>
    <div class="device-macro__mode">
      <h4>{{ t('messages.macroSetting') }}</h4>
      <div class="macro-setting">
        <div class="macro-setting__choose">
          <p>{{ t('messages.macroKeySelect') }}</p>
          <!-- <t-select v-model="curMacroIdx" :options="selectList"></t-select> -->
          <div>{{ `Macro${curMacroIdx}` }}</div>
        </div>
        <div class="macro-setting__mode">
          <p>{{ t('messages.macroModeSelect') }}</p>
          <div>
            <t-radio-group v-model="curMacroMode.mode" :disabled="isRecording" @click="handleMacroMode">
              <t-radio v-for="(option, index) in modeOptions" :key="index" :value="index">
                <template v-if="index < 4">
                  {{ t('messages.macroModeClickRepeat') }}
                  <t-input-number
                    v-if="curMacroMode.mode === index"
                    v-model="repNumValue"
                    class="rep-num-input"
                    :min="1"
                    :max="9999"
                    :step="1"
                    size="small"
                    :disabled="isRecording"
                    @blur="handleMacroMode"
                  />
                  <template v-else>--</template>
                  <template v-if="index === 0">
                    {{ t('messages.macroTimes') + t('messages.macroClickNoEffect') }}
                  </template>
                  <template v-if="index === 1">
                    {{ t('messages.macroTimes') + t('messages.macroClickRestart') }}
                  </template>
                  <template v-if="index === 2">
                    {{ t('messages.macroTimes') + t('messages.macroClickStop') }}
                  </template>
                  <template v-if="index === 3">
                    {{ t('messages.macroTimes') + t('messages.macroClickFinish') }}
                  </template>
                </template>
                <template v-else-if="index === 4">
                  {{ t('messages.macroModeHoldRepeatStop') }}
                </template>
                <template v-else>
                  {{ t('messages.macroModeHoldRepeatFinish') }}
                </template>
              </t-radio>
            </t-radio-group>
          </div>
        </div>
      </div>
    </div>
    <div class="device-macro__data">
      <h4>{{ t('messages.macroRecord') }}</h4>
      <macro-data v-model:macros="curMacroData" @confirm="handleMacroData" />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'DeviceMacro' });

import { MessagePlugin } from 'tdesign-vue-next';
import { useMacroStore } from '@/store';
import { keyboardMapByType } from '@/config/byte-to-key/keyboard-map';
import emitter from '@/utils/app-emitter';
import MacroData from './components/MacroData.vue';
import macroKey from './components/key.vue';
import { t } from '@/locales';

const macroStore = useMacroStore();
const { currentMacroNum } = storeToRefs(macroStore);
const macros = ref([]);
const curMacroIdx = ref(0);
const curMacroMode = reactive({ mode: 0, repNum: 1 });
const curMacroData = reactive({ data: [] });
const isRecording = ref(false);

const macroDataLength = computed(() => {
  return (idx) => {
    // if (macros.value.length > 0) {
    const macroData = macros.value[idx]?.data?.filter(
      (item) => !(item.keyCode === 0 && item.delay === 0 && item.status === 0),
    );
    // console.log('macroDataLength', macroData);
    return macroData?.length || 0;
    // }
    // return 0;
  };
});
const modeOptions = computed(() => {
  return [
    `点击执行，重复`,
    `点击执行，重复`,
    `点击执行，重复`,
    `点击执行，重复`,
    `按住执行，重复次数无限，松开后立即停止执行`,
    `按住执行，重复次数无限，松开后完成本次宏后停止执行`,
  ];
});

const repNumValue = computed({
  get: () => (curMacroMode.repNum === 0xffff ? 1 : curMacroMode.repNum),
  set: (value) => {
    curMacroMode.repNum = value;
  },
});

onMounted(async () => {
  if (macroStore.macroData.length === 0) {
    await macroStore.getMacroAllData();
  }
});

watchEffect(() => {
  macros.value = macroStore.macroData;
  const curMacro = macros.value[curMacroIdx.value] || { mode: 0, repNum: 1, data: [] };
  curMacroMode.mode = curMacro.mode;
  curMacroMode.repNum = curMacro.repNum === 0 ? 1 : curMacro.repNum;
  // curMacro.repNum = curMacroMode.repNum;
  curMacroData.data = curMacro.data.filter((item) => !(item.keyCode === 0 && item.delay === 0 && item.status === 0));
});

// 切换宏
const chooseMacro = (idx) => {
  curMacroIdx.value = idx;
};

// 编辑宏事件
const handleMacroData = async (actions) => {
  macros.value[curMacroIdx.value].data = JSON.parse(JSON.stringify(actions));
  macros.value[curMacroIdx.value].actNum = actions.length;
  const { macroId, actNum, repNum, mode } = macros.value[curMacroIdx.value];
  if (currentMacroNum.value + actNum > 960) {
    MessagePlugin.error('宏数量超过960，请先删除一些宏');
    return;
  }
  // 首先设置宏模式  然后在调用调用宏设置的API
  await macroStore.setMacroMode({ macroId, actNum, repNum, mode, valid: 1 });
  await macroStore.setMacroData({ macroId: curMacroIdx.value, actions });
};

// 修改宏模式
const handleMacroMode = async () => {
  // 验证输入值
  if (repNumValue.value === undefined || repNumValue.value === null) {
    repNumValue.value = 1;
  } else {
    const intValue = Math.floor(Number(repNumValue.value));
    if (Number.isNaN(intValue) || intValue < 1) {
      repNumValue.value = 1;
    } else if (intValue > 9999) {
      repNumValue.value = 9999;
    } else {
      repNumValue.value = intValue;
    }
  }

  macros.value[curMacroIdx.value].mode = curMacroMode.mode;
  if (curMacroMode.mode === 4 || curMacroMode.mode === 5) {
    macros.value[curMacroIdx.value].repNum = 0xffff;
  } else {
    macros.value[curMacroIdx.value].repNum = curMacroMode.repNum;
  }
  const { macroId, actNum, repNum, mode } = macros.value[curMacroIdx.value];
  if (!repNum) {
    return;
  }
  if (currentMacroNum.value + actNum > 960) {
    MessagePlugin.error('宏数量超过960，请先删除一些宏');
    return;
  }
  await macroStore.setMacroMode({ macroId, actNum, repNum, mode, valid: 1 });
  await macroStore.setMacroData({ macroId, actions: macros.value[curMacroIdx.value].data });
};

emitter.on('isRecording', (val) => {
  isRecording.value = val;
});
</script>

<style scoped lang="less">
@import './index.less';
</style>
