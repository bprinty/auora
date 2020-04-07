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


/**
 * Clone object recursively.
 */
export function clone(obj) {
    if (isArray(obj)) {
      return obj.map(item => clone(item));
    } else if (isObject(obj)) {
      const result = {};
      Object.keys(obj).forEach(key => {
        result[key] = clone(obj[key]);
      })
      return result;
    } else {
      return obj;
    }
}


/**
 * Recursively check for object equality.
 */
export function deepEqual(target, other) {
  // compare types
  if (typeof target !== typeof other) {
    return false;
  }

  // compare arrays
  if (isArray(target)) {
    if (target.length != other.length) {
      return false;
    }
    for(let i=0; i<target.length; i += 1) {
      if (!deepEqual(target[i], other[i])) {
        return false;
      }
    }
    return true;

  // compare objects
  } else if (isObject(target)) {
    const keys = Object.keys(target).sort();
    if (!deepEqual(keys, Object.keys(other).sort())) {
      return false;
    }
    for(let i=0; i<keys.length; i += 1) {
      const key = keys[i];
      if (!deepEqual(target[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  // compare values
  return target === other;
}
