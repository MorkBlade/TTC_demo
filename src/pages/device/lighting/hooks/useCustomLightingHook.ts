import { useLightingStore } from '@/store';

export function useCustomLightingHook() {
  const hexColor = ref('#ffffff');
  const rgb = reactive({ R: 0, G: 82, B: 217 });
  const lightingStore = useLightingStore();

  watchEffect(() => {
    const { R, G, B } = lightingStore.colorPickerPanel;
    rgb.R = R;
    rgb.G = G;
    rgb.B = B;
  });

  const rgbToHex = (r, g, b) => {
    // 确保 R、G、B 在 0~255 范围内
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // 转换为 2位 HEX，补零
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');

    // 拼接成 #RRGGBB
    return `#${hexR}${hexG}${hexB}`.toUpperCase(); // 可选：转为大写
  };

  const handleCustomChange = (value) => {
    let inputColor = value;
    if (!inputColor.startsWith('#')) {
      inputColor = `#${inputColor}`;
    }
    const R = parseInt(inputColor.slice(1, 3), 16);
    const G = parseInt(inputColor.slice(3, 5), 16);
    const B = parseInt(inputColor.slice(5, 7), 16);
    lightingStore.colorPickerPanel.R = R;
    lightingStore.colorPickerPanel.G = G;
    lightingStore.colorPickerPanel.B = B;
  };

  const handleUpdateFromRgb = () => {
    // 先对 RGB 值进行取整，确保为整数
    let R = Math.round(rgb.R);
    let G = Math.round(rgb.G);
    let B = Math.round(rgb.B);
    // 确保 RGB 值在有效范围内
    R = Math.min(255, Math.max(0, R));
    G = Math.min(255, Math.max(0, G));
    B = Math.min(255, Math.max(0, B));
    // 更新本地 rgb 值，确保显示的值也是合法的
    rgb.R = R;
    rgb.G = G;
    rgb.B = B;
    lightingStore.colorPickerPanel.R = R;
    lightingStore.colorPickerPanel.G = G;
    lightingStore.colorPickerPanel.B = B;
    // grb 转换 HEX
    hexColor.value = rgbToHex(R, G, B);
  };

  const handleHEXUpdateColor = (event) => {
    let inputColor = event.target.value;
    // 检查是否以#开头
    const hasHash = inputColor.startsWith('#');
    // 移除#号后再处理
    inputColor = inputColor.replace('#', '');
    // 只允许输入A-F、a-f的字母和0-9的数字
    inputColor = inputColor.replace(/[^A-Fa-f0-9]/g, '');
    // 根据是否有#号限制长度：有#号最多7位（包括#号），没有#号最多6位
    const maxLength = hasHash ? 6 : 6; // 实际字符长度（不包括#号）
    inputColor = inputColor.slice(0, maxLength);
    // 如果原来有#号，则加回#号
    if (hasHash) {
      inputColor = `#${inputColor}`;
    }
    // 更新输入框的值
    event.target.value = inputColor;
    // 同步修正v-model绑定的hexColor
    hexColor.value = inputColor;

    if (!inputColor.startsWith('#')) {
      inputColor = `#${inputColor}`;
    }
    const R = parseInt(inputColor.slice(1, 3), 16);
    const G = parseInt(inputColor.slice(3, 5), 16);
    const B = parseInt(inputColor.slice(5, 7), 16);
    lightingStore.colorPickerPanel.R = R;
    lightingStore.colorPickerPanel.G = G;
    lightingStore.colorPickerPanel.B = B;
  };

  const blockDot = (e: KeyboardEvent) => {
    if (e.key === '.' || e.key === 'Decimal') {
      e.preventDefault();
    }
  };

  return {
    hexColor,
    rgb,
    handleCustomChange,
    handleUpdateFromRgb,
    handleHEXUpdateColor,
    blockDot,
  };
}
