/**
 * Placholder for proxy logic
 */

import { PubSub } from './pubsub';
import { isFunction, isObject, isArray } from './utils';


/**
 * List of array modifiers to dispatch callbacks on.
 */
const ARRAY_MODIFIERS = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
];

/**
 * List of object modifiers to dispatch callbacks on.
 */
const OBJECT_MODIFIERS = [
  'update',
];


/**
 * Observable class for watching nested data changes and issuing
 * before/after callbacks.
 *
 * @param {object, array} target - Data to create nested proxy for.
 * @param {function} callback - Callback to execute after global
 *     update/delete events.
 */
export class Observable {
  constructor(target, callback) {
    // normalize inputs
    target = target || {};

    // array
    if (isArray(target)) {
      return new ArrayProxy(target, callback);
    }

    // object
    else if (isObject(target)) {
      return new ObjectProxy(target, callback);
    }

    // other
    else {
      throw new Error('Cannot create Observable type for non Array or Object type.');
    }
  }
}

/**
 * Abstract class for managing proxies with subscriptions.
 */
class PublishingProxy {
  constructor(callback) {
    // set up pubsub for object
    self = this;
    self.events = new PubSub();
    if (isFunction(callback)) {
      self.events.subscribe('update', callback);
      self.events.subscribe('delete', callback);
      self.events.subscribe('reset', callback);
    }
  }

  /**
   * Subscribe to object or specific data changes.
   *
   * @param {string} event - Event name to subscribe to. Can be
   *     `beofre`/`after` for global changes, or a specific
   *     data key name.
   * @param {function} callback - Callback to execute when event
   *     is published.
   */
  subscribe(event, callback) {
    // shorthand
    if (isFunction(event)) {
      self.events.subscribe('update', callback);
      self.events.subscribe('delete', callback);
      self.events.subscribe('reset', callback);

    // specific event
    } else if (isFunction(callback)) {
      self.events.subscribe(event, callback);
    }
  }
}


/**
 * Class for creating nested proxies from object type.
 *
 * @param {object, array} target - Data to create nested proxy for.
 * @param {function} callback - Callback to execute after global
 *     update/delete events.
 */
class ObjectProxy extends PublishingProxy {
  constructor(target, callback) {
    super(callback);
    self = this;

    // proxify nested objects
    const backup = Object.assign({}, target);
    Object.keys(target).forEach(key => {
      if (isObject(target[key])) {
        target[key] = new ObjectProxy(target[key], callback);
      } else if (isArray(target[key])) {
        target[key] = new ArrayProxy(target[key], callback);
      }
    });

    // return proxy with callbacks for modifiers
    return new Proxy(target, {
      // get with publish for modifiers
      get(obj, prop) {

        // handle proxy reset
        if (prop === 'reset') {
          return () => {
            Object.keys(obj).forEach(key => {
              if (key in backup) {
                obj[key] = backup[key];
              } else {
                delete obj[key]
              }
            });
            self.events.publish('reset');
          }
        }

        // handle proxy update (performance improvement vs Object.assign)
        if (prop === 'update') {

          // return update function
          return (values) => {
            // proxify nested objects
            Object.keys(values).forEach(key => {
              if (isObject(values[key])) {
                values[key] = new ObjectProxy(values[key], callback);
              } else if (isArray(target[key])) {
                values[key] = new ArrayProxy(values[key], callback);
              }
            });

            // assign data and publish
            obj = Object.assign(obj, values);
            self.events.publish('update');
          }
        }

        return obj[prop];
      },

      // setter with publish
      set(obj, prop, value) {
        if (isObject(value)) {
          obj[prop] = new ObjectProxy(value, callback);
        } else if (isArray(value)) {
          obj[prop] = new ArrayProxy(value, callback);
        } else {
          obj[prop] = value;
        }
        self.events.publish(prop);
        self.events.publish('update', prop, value);
        return true;
      },

      // delete with publish
      deleteProperty(obj, prop) {
        delete obj[prop];
        self.events.publish(prop);
        self.events.publish('delete', prop);
        return true;
      }
    });
  }
}


/**
 * Class for creating nested proxies from array type.
 *
 * @param {object, array} target - Data to create nested proxy for.
 * @param {function} callback - Callback to execute after global
 *     update/delete events.
 */
class ArrayProxy extends PublishingProxy {
  constructor(target, callback) {
    super(callback);
    self = this;

    // create semi-shallow clone for defaults
    const backup = target.map((x) => {
      if (isObject(x)) {
        return Object.assign({}, x);
      } else if (isArray(x)) {
        return x.slice();
      }
      return x;
    });

    // proxy nested data
    target = target.map((x) => {
      if (isObject(x)) {
        return new ObjectProxy(x, callback);
      } else if (isArray(x)) {
        return new ArrayProxy(x, callback);
      }
      return x;
    });

    // return proxy with callbacks for modifiers
    return new Proxy(target, {
      // get with publish for modifiers
      get(obj, prop) {

        // handle proxy reset
        if (prop === 'reset') {
          return () => {
            obj.splice(0, obj.length);
            obj.push(...backup);
            self.events.publish('reset');
          }
        }

        // handle function modifiers
        const value = obj[prop];
        if (typeof value === 'function') {

          // modifiers
          if(ARRAY_MODIFIERS.includes(prop)) {
            return (...args) => {
              const result = obj[prop](...args);
              self.events.publish(prop);
              self.events.publish('update');
              return result;
            }
          }

          // non-modifiers
          return value.bind(obj);
        }
        return value;
      },

      // set with publish
      set(obj, prop, value) {
        if (isObject(value)) {
          obj[prop] = new ObjectProxy(value, callback);
        } else if (isArray(value)) {
          obj[prop] = new ArrayProxy(value, callback);
        } else {
          obj[prop] = value;
        }
        self.events.publish(prop);
        self.events.publish('update', prop, value);
        return true;
      },

      // delete with publish
      deleteProperty(obj, prop) {
        obj.splice(prop, 1);
        self.events.publish(prop);
        self.events.publish('delete', prop);
        return true;
      }
    });
  }
}
