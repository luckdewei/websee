export function deepCopy(object, map =new WeakMap()) {
  // 如果是基本数据类型 直接返回
  if (!object || typeof object !== 'object') return object
  // 考虑循环引用
  if (map.get(object)) return map.get(object)

  let newObject = Array.isArray(object) ? [] : {}

  map.set(object, newObject)

  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      newObject[key] =
        typeof object[key] === 'object' ? deepCopy(object[key]) : object[key]
    }
  }

  return newObject
}

export function generateUniqueId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
}