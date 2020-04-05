/**
 * Helper methods.
 */

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Check if object is promise.
 */
export function isPromise(obj) {
  return typeof obj !== 'undefined' && typeof obj.then === 'function';
}

/**
 * Check if object is function.
 */
export function isFunction(obj) {
  return typeof obj === "function";
}

/**
 * Check if object is array type.
 */
export function isArray(obj) {
  return Array.isArray(obj);
}

/**
 * Check if object is plain object type.
 */
export function isObject(obj) {
 return (typeof obj === 'object') && (obj !== null) && !Array.isArray(obj);
}
