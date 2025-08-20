export const rgbToHex = (R: number, G: number, B: number) => {
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        R: parseInt(result[1], 16),
        G: parseInt(result[2], 16),
        B: parseInt(result[3], 16),
      }
    : null;
};
