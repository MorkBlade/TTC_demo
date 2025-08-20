export const appVersionVeify = (version: string, supportDouble: boolean) => {
  if (version >= '1.0.1.0' && supportDouble) {
    return true;
  }
  return false;
};
