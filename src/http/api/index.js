// import { BASE_URLS } from '../config.js';
import { request } from '../request.js';
// TODO:请求失败的问题 具体失败问题需要添加上
export const httpService = {
  // 获取轴体文件
  getAxisList: (params) => request.get('https://api.sparklinkplayjoy.com/api/v1', '/getAxisList', params),
  getAxisListV2: (params) => request.get('https://api.sparklinkplayjoy.com/api/v1', '/getAxisListV2', params),
  getFirmwarePack: (params) => request.get('https://api.sparklinkplayjoy.com/api/v1', '/getKeyboardFirmware', params),
  exportConfiguration: (params) => request.post('https://api.sparklinkplayjoy.com/api/v1', '/createKbConfig', params),
};
