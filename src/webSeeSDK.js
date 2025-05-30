import performance from './preformance/index';
import error from './error/index';
import behavior from './behavior/index';
import { setConfig } from './config';
import { lazyReportBatch } from './report';
window.__webSeeSDK__ = {
  version: '0.0.1',
};

// 针对Vue项目的错误捕获
export function install(Vue, options) {
  if (__webSeeSDK__.vue) return;
  __webSeeSDK__.vue = true;
  setConfig(options);
  const handler = Vue.config.errorHandler;
  // vue项目中 通过 Vue.config.errorHandler 捕获错误
  Vue.config.errorHandler = function (err, vm, info) {
    // todo: 上报具体的错误信息
    const reportData = {
      info,
      error: err.stack,
      subType: 'vue',
      type: 'error',
      startTime: window.performance.now(),
      pageURL: window.location.href,
    };
    lazyReportBatch(reportData);
    if (handler) {
      handler.call(this, err, vm, info);
    }
  };
}
// 针对React项目的错误捕获
export function errorBoundary(err, info) {
  if (__webSeeSDK__.react) return;
  __webSeeSDK__.react = true;
  // todo: 上报具体的错误信息
  const reportData = {
    error: err?.stack,
    info,
    subType: 'react',
    type: 'error',
    startTime: window.performance.now(),
    pageURL: window.location.href,
  };
  lazyReportBatch(reportData);
}
export function init(options) {
  setConfig(options);
  performance();
  error();
  behavior();
}

export default {
  install,
  errorBoundary,
  performance,
  error,
  behavior,
  init,
}