import { lazyReportBatch } from '../report';

export default function observerPaint() {
  const entryHandler = (list) => {
    for(const entry of list.getEntries()) {
      if (entry.name === 'first-paint') {
        observer.disconnect()
        const json = entry.toJSON()
        console.log(json);
        const reportData = {
          ...json,
          type: 'performance',
          subType: entry.name,
          pageUrl: window.location.href
        }
        // 发送数据 todo
        lazyReportBatch(reportData);
      }
    }
  }
  
  const observer = new PerformanceObserver(entryHandler)
  observer.observe({type: 'paint', buffered: true})
}
