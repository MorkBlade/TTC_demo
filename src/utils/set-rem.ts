// src/utils/setRem.ts
export function setHtmlFontSize(designWidth = 1920, baseRem = 16) {
  const doc = document.documentElement;
  const width = doc.clientWidth;
  const scale = width / designWidth;
  doc.style.fontSize = `${baseRem * scale}px`;
}
