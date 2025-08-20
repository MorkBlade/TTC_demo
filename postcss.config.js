export default {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16, // 和运行时 baseFontSize 一致
      unitPrecision: 5, // 转换精度
      propList: ['*'], // 所有属性都转
      selectorBlackList: ['.ignore-', /^\.no-rem/], // 忽略选择器
      mediaQuery: false, // 不处理媒体查询内 px
      minPixelValue: 2, // 小于2px不转换
    },
  },
};
