export default function observerLoad() {
  window.addEventListener('pageshow', function (event) {
    requestAnimationFrame(() => {
      ['load'].forEach((type) => {
        const reportData = {
          type: 'performance',
          subType: type,
          pageUrl: window.location.href,
          startTime: performance.now() - event.timeStamp
        }
        // 发送数据
      });

    });
  }, true);
}