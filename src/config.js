// config 默认值
const config = {
  url: 'http://127.0.0.1:8080/api',
  projectName: 'eyesdk',
  appId: '123456',
  userId: '123456',
  isImageUpload: false,
  batchSize: 5,
};
// 暴露一个方法，用来修改默认值
export function setConfig(options) {
  for (const key in config) {
      if (options[key]) {
          config[key] = options[key];
      }
  }
}
export default config;