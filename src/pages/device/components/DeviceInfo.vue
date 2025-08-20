<template>
  <div class="device-info">
    <img src="@/assets/images/logo.png" alt="" />
    <div class="device-info-detail">
      <span>{{ device?.productName || '' }}</span>
      &nbsp;
      <icon-font name="keyboard" />
      <span>{{ connectDeviceStatus ? t('messages.deviceConnected') : t('messages.deviceDisconnected') }}</span>
      <p>sn: {{ info?.sn || '' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconFont } from 'tdesign-icons-vue-next';
import { useDeviceStore } from '@/store';
import { t } from '@/locales';

const deviceStore = useDeviceStore();
const { device, connectDeviceStatus, info } = storeToRefs(deviceStore);
</script>

<style lang="less" scoped>
.device-info {
  margin-top: 15px;
  margin-bottom: 25px;
  box-sizing: border-box;
  text-align: center;
  border-radius: 8px;
  background-color: transparent;

  & > img {
    width: 100px;
    height: 50px;
    margin-bottom: 20px;
  }

  &-detail {
    color: #fff;
    padding: 8px 10px;

    > span {
      font-size: 20px;
      &:nth-of-type(2) {
        color: #0052d9;
        font-size: 12px;
      }
    }

    > i {
      margin-right: 5px;
      color: #0052d9;
      // text-align: top;
    }

    > p {
      margin-top: 10px;
    }
  }
}
</style>
