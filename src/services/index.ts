import XDKeyboard from '@sparklinkplayjoy/sdk-keyboard-v2';

const service = new XDKeyboard({
  configs: [
    { vendorId: 0x1ca6, usagePage: 0xffb0, usage: 0x01 },
    { vendorId: 0x38a6, productId: 0x28d2, usagePage: 0xffb0, usage: 0x01 },
  ],
  usage: 0x01,
  usagePage: [0xffb0],
});

export default service;
