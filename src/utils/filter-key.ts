export const filterAdvancedKey = (keyboards, keyValue) => {
  let unBinding = false;
  for (let row = 0; row < keyboards.length; row++) {
    for (let col = 0; col < keyboards[row].length; col++) {
      if (keyboards[row][col].keyValue !== keyValue) continue;
      const { advancedKeys } = keyboards[row][col];
      if (advancedKeys.advancedType) {
        unBinding = true;
      }
    }
  }

  return unBinding;
};

export const filterAdvancedKeyByPosition = (keyboards, position: { row: number; col: number }) => {
  let unBinding = false;
  const { advancedKeys } = keyboards[position.row][position.col];
  if (advancedKeys.advancedType) {
    unBinding = true;
  }
  return unBinding;
};
