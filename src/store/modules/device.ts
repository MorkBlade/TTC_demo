import { defineStore } from 'pinia';

import services from '@/services/index';
import emitter from '@/utils/app-emitter';

export enum EVENT {
  GETDEVICEINFO = 'GETDEVICEINFO',
  INPUTREPORT = 'INPUTREPORT',
  USBCHANGE = 'usbChange', // 新增
  SWITCHCONFIG = 'switchConfig', // 新增
  CUSTOMCOMMAND = 'customCommand', // 新增
  LIGHTINGBASE = 'lightingBase', // 新增灯光监听
}

interface UsbChangeData {
  device?: {
    collections?: any[];
    productName?: string;
    // ... 其他字段
  };
  updateFail?: boolean;
  type?: string;
  reconnect?: boolean;
  // ... 其他字段
}
interface DeviceInfo {
  data: string;
  id: string;
  usage: number;
  usagePage: number;
  vendorId: number;
  productId: number;
  productName: string;
}

interface DeviceState {
  devices: DeviceInfo[];
  device: DeviceInfo;
  report: any[];
  version: {
    mainVersion: number;
    subVersion: number;
    hardwareVersion: number;
    softwareVersion: number;
  };
  connectDeviceStatus: boolean;
  requestDeviceStatus: any;
  info: any;
  hasNewVersion: boolean;
  resBin: any;
  binData: any;
  isUpdate: boolean;
  httpReturnNoFirmware: boolean;
  delayTime: number;
}

const state: DeviceState = {
  devices: [],
  device: {} as DeviceInfo,
  report: [],
  version: {
    mainVersion: 0,
    subVersion: 0,
    hardwareVersion: 0,
    softwareVersion: 0,
  },
  connectDeviceStatus: false,
  requestDeviceStatus: null,
  info: null,
  hasNewVersion: false,
  resBin: '',
  binData: '',
  isUpdate: false,
  httpReturnNoFirmware: false,
  delayTime: 0,
};

export const useDeviceStore = defineStore('device', {
  state: () => state,

  getters: {
    deviceId: (state) => state.device.id,
    deviceHid: (state) => state.device.data,
  },

  actions: {
    async connectDevice() {
      try {
        services.on(EVENT.GETDEVICEINFO, (requestDeviceStatus) => {
          this.requestDeviceStatus = requestDeviceStatus;
        });
        services.on(EVENT.USBCHANGE, (data: UsbChangeData) => {
          if (data.type === 'disconnect' || data.type === 'isUpgrading_disconnect') {
            // 如果不是在升级页面的话 路由回到连接页面
            if (!this.isUpdate) {
              emitter.emit('disconnect', this.isUpdate);
            }
          }
        });

        const devices = await services.getDevices();
        console.log(devices, 'devices');
        // 监听设备拔插
        if (devices.length > 0) {
          const [device] = devices;
          this.devices = devices;
          this.device = device;
          if (device) {
            await services.init(device.id);
            this.connectDeviceStatus = true;
            return true;
          }
          return false;
        }
        return false;
      } catch (error) {
        console.log('error', error);
        return false;
      }
    },
    setUpdateStatus(data: boolean) {
      this.isUpdate = data;
    },

    // 获取协议版本
    async getProtocolVersion() {
      const version = await services.getProtocolVersion();
      this.version = version;
      return version;
    },

    // 获取设备信息
    async getDeviceInfo() {
      const info = await services.getDevicesInfo();
      this.info = info;
      return info;
    },

    // 设备升级
    async updateDevice(data, fn) {
      const update = await services.upgrade(data, fn);
      return update;
    },

    // boot模式
    async appToBoot() {
      const res = await services.appToBoot();
      return res;
    },

    // app模式
    async bootToApp() {
      const res = await services.bootToApp();
      return res;
    },
  },
});
