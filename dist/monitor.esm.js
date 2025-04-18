// config 默认值
var config = {
  url: 'http://127.0.0.1:8080/api',
  projectName: 'eyesdk',
  appId: '123456',
  userId: '123456',
  isImageUpload: false,
  batchSize: 5
};
// 暴露一个方法，用来修改默认值
function setConfig(options) {
  for (var key in config) {
    if (options[key]) {
      config[key] = options[key];
    }
  }
}

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = true, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function deepCopy(object) {
  var map = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : WeakMap();
  // 如果是基本数据类型 直接返回
  if (!object || _typeof(object) !== 'object') return object;
  // 考虑循环引用
  if (map.get(object)) return map.get(object);
  var newObject = Array.isArray(object) ? [] : {};
  map.set(object, newObject);
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      newObject[key] = _typeof(object[key]) === 'object' ? deepCopy(object[key]) : object[key];
    }
  }
  return newObject;
}
function generateUniqueId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

var cache = [];
function getCache() {
  return deepCopy(cache);
}
function addCache(data) {
  cache.push(data);
}
function clearCache() {
  cache.length = 0;
}

var originalOpen$1 = XMLHttpRequest.prototype.open;
var originalSend$1 = XMLHttpRequest.prototype.send;
function report(data) {
  if (!config.url) {
    console.error('请设置上传 url 地址');
  }
  var reportData = JSON.stringify({
    id: generateUniqueId(),
    data: data
  });
  // 上报数据，使用图片的方式
  if (config.isImageUpload) {
    imgRequest(reportData);
  } else {
    // 优先使用 sendBeacon
    if (window.navigator.sendBeacon) {
      return beaconRequest(reportData);
    } else {
      xhrRequest(reportData);
    }
  }
}
// 批量上报数据
function lazyReportBatch(data) {
  addCache(data);
  var dataCache = getCache();
  console.error('dataCache', dataCache);
  if (dataCache.length && dataCache.length > config.batchSize) {
    report(dataCache);
    clearCache();
  }
  //
}
// 图片发送数据
function imgRequest(data) {
  var img = new Image();
  // http://127.0.0.1:8080/api?data=encodeURIComponent(data)
  img.src = "".concat(config.url, "?data=").concat(encodeURIComponent(JSON.stringify(data)));
}
// 普通ajax发送请求数据
function xhrRequest(data) {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(function () {
      var xhr = new XMLHttpRequest();
      originalOpen$1.call(xhr, 'post', config.url);
      originalSend$1.call(xhr, JSON.stringify(data));
    }, {
      timeout: 3000
    });
  } else {
    setTimeout(function () {
      var xhr = new XMLHttpRequest();
      originalOpen$1.call(xhr, 'post', url);
      originalSend$1.call(xhr, JSON.stringify(data));
    });
  }
}

// const sendBeacon = isSupportSendBeacon() ? navigator.sendBeacon : xhrRequest
function beaconRequest(data) {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(function () {
      window.navigator.sendBeacon(config.url, data);
    }, {
      timeout: 3000
    });
  } else {
    setTimeout(function () {
      window.navigator.sendBeacon(config.url, data);
    });
  }
}

var originalFetch = window.fetch;
function overwriteFetch() {
  window.fetch = function newFetch(url, config) {
    var startTime = Date.now();
    var reportData = {
      type: 'performance',
      subType: 'fetch',
      url: url,
      startTime: startTime,
      method: config.method
    };
    return originalFetch(url, config).then(function (res) {
      var endTime = Date.now();
      reportData.endTime = endTime;
      reportData.duration = endTime - startTime;
      var data = res.clone();
      reportData.status = data.status;
      reportData.success = data.ok;
      // todo 上报数据
      lazyReportBatch(reportData);
      return res;
    }).catch(function (err) {
      var endTime = Date.now();
      reportData.endTime = endTime;
      reportData.duration = endTime - startTime;
      reportData.status = 0;
      reportData.success = false;
      // todo 上报数据
      lazyReportBatch(reportData);
    });
  };
}
function fetch() {
  overwriteFetch();
}

// 前端静态资源收集
function observerEntries() {
  if (document.readyState === 'complete') {
    observerEvent();
  } else {
    var _onLoad = function onLoad() {
      observerEvent();
      window.removeEventListener('load', _onLoad, true);
    };
    window.addEventListener('load', _onLoad, true);
  }
}
function observerEvent() {
  var entryHandler = function entryHandler(list) {
    var data = list.getEntries();
    var _iterator = _createForOfIteratorHelper(data),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        if (observer) {
          observer.disconnect();
        }
        console.log('entry', entry);
        var reportData = {
          name: entry.name,
          // 资源的名字
          type: 'performance',
          // 类型
          subType: entry.entryType,
          //类型
          sourceType: entry.initiatorType,
          // 资源类型
          duration: entry.duration,
          // 加载时间
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          // dns解析时间
          tcp: entry.connectEnd - entry.connectStart,
          // tcp连接时间
          redirect: entry.redirectEnd - entry.redirectStart,
          // 重定向时间
          ttfb: entry.responseStart,
          // 首字节时间
          protocol: entry.nextHopProtocol,
          // 请求协议
          responseBodySize: entry.encodedBodySize,
          // 响应内容大小
          responseHeaderSize: entry.transferSize - entry.encodedBodySize,
          // 响应头部大小
          transferSize: entry.transferSize,
          //真实的请求内容大小
          resourceSize: entry.decodedBodySize,
          // 资源解压后的大小
          startTime: performance.now()
        };
        lazyReportBatch(reportData);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };
  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: ['resource'],
    buffered: true
  });
}

function observerLCP() {
  var entryHandler = function entryHandler(list) {
    if (observer) {
      observer.disconnect();
    }
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        var json = entry.toJSON();
        console.log(json);
        var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
          type: 'performance',
          subType: entry.name,
          pageUrl: window.location.href
        });
        // 发送数据 todo
        lazyReportBatch(reportData);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };
  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'largest-contentful-paint',
    buffered: true
  });
}

function observerFCP() {
  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        if (entry.name === 'first-contentful-paint') {
          observer.disconnect();
          var json = entry.toJSON();
          console.log(json);
          var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
            type: 'performance',
            subType: entry.name,
            pageUrl: window.location.href
          });
          // 发送数据 todo
          lazyReportBatch(reportData);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };
  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'paint',
    buffered: true
  });
}

function observerLoad() {
  window.addEventListener('pageshow', function (event) {
    requestAnimationFrame(function () {
      ['load'].forEach(function (type) {
        var reportData = {
          type: 'performance',
          subType: type,
          pageUrl: window.location.href,
          startTime: performance.now() - event.timeStamp
        };
        // 发送数据
        lazyReportBatch(reportData);
      });
    });
  }, true);
}

function observerPaint() {
  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        if (entry.name === 'first-paint') {
          observer.disconnect();
          var json = entry.toJSON();
          console.log(json);
          var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
            type: 'performance',
            subType: entry.name,
            pageUrl: window.location.href
          });
          // 发送数据 todo
          lazyReportBatch(reportData);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };
  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'paint',
    buffered: true
  });
}

// 重写XMLHttpRequest
// 重写XMLHttpRequest.open方法
// 重写XMLHttpRequest.send方法
var originalProto = XMLHttpRequest.prototype;
var originalSend = originalProto.send;
var originalOpen = originalProto.open;
function overwriteOpenAndSend() {
  originalProto.open = function newOpen() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    this.url = args[1];
    this.method = args[0];
    originalOpen.apply(this, args);
  };
  originalProto.send = function newSend() {
    var _this = this;
    this.startTime = Date.now();
    var _onLoaded = function onLoaded() {
      _this.endTime = Date.now();
      _this.duration = _this.endTime - _this.startTime;
      var url = _this.url,
        method = _this.method,
        startTime = _this.startTime,
        endTime = _this.endTime,
        duration = _this.duration,
        status = _this.status;
      var reportData = {
        status: status,
        duration: duration,
        startTime: startTime,
        endTime: endTime,
        url: url,
        method: method.toUpperCase(),
        type: 'performance',
        success: status >= 200 && status < 300,
        subType: 'xhr'
      };
      // todo 发送数据
      lazyReportBatch(reportData);
      _this.removeEventListener('loadend', _onLoaded, true);
    };
    this.addEventListener('loadend', _onLoaded, true);
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    originalSend.apply(this, args);
  };
}
function xhr() {
  overwriteOpenAndSend();
}

function performance$1() {
  fetch();
  observerEntries();
  observerLCP();
  observerFCP();
  observerLoad();
  observerPaint();
  xhr();
}

function error() {
  // 捕获资源加载失败的错误： js css img
  window.addEventListener('error', function (e) {
    var target = e.target;
    // 如果没有target 则是js错误 直接返回
    if (!target) return;
    // 处理静态资源错误
    if (target.src || target.href) {
      target.src || target.href;
      ({
        html: target.outerHTML,
        pahts: e.path // 具体的资源路径
      });
      // todo 发送错误信息
    }
  }, true);
  // 捕获js错误
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    var reportData = {
      type: 'error',
      subType: 'js',
      msg: msg,
      // 表示错误信息的文本描述
      url: url,
      // 表示发生错误的脚本的URL
      lineNo: lineNo,
      // 表示发生错误的行号
      columnNo: columnNo,
      // 表示发生错误的列号
      stack: error.stack,
      // 表示错误的堆栈信息
      pageUrl: window.location.href,
      startTime: performance.now() // 表示错误发生的时间戳
    };
    // todo 发送错误信息
    lazyReportBatch(reportData);
  };
  // 捕获promise错误  asyn await
  window.addEventListener('unhandledrejection', function (e) {
    var _e$reason;
    var reportData = {
      type: 'error',
      subType: 'promise',
      reason: (_e$reason = e.reason) === null || _e$reason === void 0 ? void 0 : _e$reason.stack,
      pageUrl: window.location.href,
      startTime: e.timeStamp
    };
    // todo 发送错误信息
    lazyReportBatch(reportData);
  }, true);
}

function click() {
  ['mousedown', 'touchstart'].forEach(function (eventType) {
    window.addEventListener(eventType, function (e) {
      var target = e.target;
      if (target.tagName) {
        var reportData = {
          // scrollTop: document.documentElement.scrollTop,
          type: 'behavior',
          subType: 'click',
          target: target.tagName,
          startTime: e.timeStamp,
          innerHtml: target.innerHTML,
          outerHtml: target.outerHTML,
          with: target.offsetWidth,
          height: target.offsetHeight,
          eventType: eventType,
          path: e.path
        };
        lazyReportBatch(reportData);
      }
    });
  });
}

function pageChange() {
  // hash histroy
  var oldUrl = '';
  window.addEventListener('hashchange', function (event) {
    console.error('hashchange', event);
    var newUrl = event.newURL;
    var reportData = {
      form: oldUrl,
      to: newUrl,
      type: 'behavior',
      subType: 'hashchange',
      startTime: performance.now(),
      uuid: generateUniqueId()
    };
    lazyReportBatch(reportData);
    oldUrl = newUrl;
  }, true);
  var from = '';
  window.addEventListener('popstate', function (event) {
    console.error('popstate', event);
    var to = window.location.href;
    var reportData = {
      form: from,
      to: to,
      type: 'behavior',
      subType: 'popstate',
      startTime: performance.now(),
      uuid: generateUniqueId()
    };
    lazyReportBatch(reportData);
    from = to;
  }, true);
}

function pv() {
  var reportData = {
    type: 'behavior',
    subType: 'pv',
    startTime: performance.now(),
    pageUrl: window.location.href,
    referror: document.referrer,
    uuid: generateUniqueId()
  };
  lazyReportBatch(reportData);
}

function behavior() {
  click(), pageChange(), pv();
}

window.__webSeeSDK__ = {
  version: '0.0.1'
};

// 针对Vue项目的错误捕获
function install(Vue, options) {
  if (__webSeeSDK__.vue) return;
  __webSeeSDK__.vue = true;
  setConfig(options);
  var handler = Vue.config.errorHandler;
  // vue项目中 通过 Vue.config.errorHandler 捕获错误
  Vue.config.errorHandler = function (err, vm, info) {
    // todo: 上报具体的错误信息
    var reportData = {
      info: info,
      error: err.stack,
      subType: 'vue',
      type: 'error',
      startTime: window.performance.now(),
      pageURL: window.location.href
    };
    lazyReportBatch(reportData);
    if (handler) {
      handler.call(this, err, vm, info);
    }
  };
}
// 针对React项目的错误捕获
function errorBoundary(err, info) {
  if (__webSeeSDK__.react) return;
  __webSeeSDK__.react = true;
  // todo: 上报具体的错误信息
  var reportData = {
    error: err === null || err === void 0 ? void 0 : err.stack,
    info: info,
    subType: 'react',
    type: 'error',
    startTime: window.performance.now(),
    pageURL: window.location.href
  };
  lazyReportBatch(reportData);
}
function init(options) {
  setConfig(options);
  // performance();
  // error();
  // behavior();
}
var webSeeSDK = {
  install: install,
  errorBoundary: errorBoundary,
  performance: performance$1,
  error: error,
  behavior: behavior,
  init: init
};

export { webSeeSDK as default, errorBoundary, init, install };
//# sourceMappingURL=monitor.esm.js.map
