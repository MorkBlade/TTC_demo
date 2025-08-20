import { useDeviceStore } from '@/store';
import { httpService } from '@/http/api/index.js';

export function useUpdateApi() {
  const deviceStore = useDeviceStore();

  // Your implementation here
  const handleOnlineUpdate = async () => {
    try {
      const boardId = deviceStore.info?.boardId.toString(16).padStart(8, '0');
      const vid = deviceStore.device?.vendorId.toString(16).padStart(4, '0');
      const pid = deviceStore.device?.productId.toString(16).padStart(4, '0');
      const params = { board_id: boardId, vid, pid, t: Date.now() };
      const res = await httpService.getFirmwarePack(params);
      deviceStore.httpReturnNoFirmware = false;
      if (res && res.firmware.firmware_name.toLowerCase().endsWith('.bin')) {
        const hasNewVersion = res.firmware.firmware_version !== `v${deviceStore.info?.appVersion}`;
        deviceStore.hasNewVersion = hasNewVersion;
        // if (hasNewVersion) {
        deviceStore.resBin = res;
        await getFirmWarePack(res.firmware.firmware_file);
        // }
      }
    } catch (error) {
      deviceStore.httpReturnNoFirmware = true;
    }
  };

  const getFirmWarePack = async (url) => {
    const relativeUrl = url.replace('https://api.sparklinkplayjoy.com', '');
    fetch(relativeUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target.result as ArrayBuffer;
          deviceStore.binData = new Uint8Array(arrayBuffer);
        };
        reader.readAsArrayBuffer(blob);
      })
      .catch((error) => {
        console.error('Error fetching the .bin file:', error);
      });
  };

  return { handleOnlineUpdate };
}
