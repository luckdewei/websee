import { lazyReportBatch } from '../report';
export default function error() {
  // 捕获资源加载失败的错误： js css img
  window.addEventListener(
    'error',
    function (e) {
      const target = e.target;
      // 如果没有target 则是js错误 直接返回
      if (!target) return;
      // 处理静态资源错误
      if (target.src || target.href) {
        const url = target.src || target.href;
        const reportData = {
          type: 'error',
          subType: 'resource',
          url,
          html: target.outerHTML,
          pageUrl: window.location.href,
          pahts: e.path, // 具体的资源路径
        };
        // todo 发送错误信息
        lazyReportBatch(reportData);
      }
    },
    true
  );
  // 捕获js错误
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    const reportData = {
      type: 'error',
      subType: 'js',
      msg, // 表示错误信息的文本描述
      url, // 表示发生错误的脚本的URL
      lineNo, // 表示发生错误的行号
      columnNo, // 表示发生错误的列号
      stack: error.stack, // 表示错误的堆栈信息
      pageUrl: window.location.href,
      startTime: performance.now(), // 表示错误发生的时间戳
    };
    // todo 发送错误信息
    lazyReportBatch(reportData);
  };
  // 捕获promise错误  asyn await
  window.addEventListener(
    'unhandledrejection',
    function (e) {
      const reportData = {
        type: 'error',
        subType: 'promise',
        reason: e.reason?.stack,
        pageUrl: window.location.href,
        startTime: e.timeStamp,
      };
      // todo 发送错误信息
      lazyReportBatch(reportData);
    },
    true
  );
}