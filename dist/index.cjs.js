'use strict';

/**
 * Simple publish-subscribe class used throughout module.
 */

/**
 * Simple publish-subscribe manager for executing events
 * on state changes.
 */
class PubSub {
  /**
   * Create a new pubsub helper
   */
  constructor() {
    this.events = {};
  }

  get empty() {
    return Object.keys(this.events).length === 0;
  }
  /**
   * Subscribe to specific event.
   *
   * @param {string} event - Event name to subscribe to.
   * @param {function} callback - Function to call on event.
   */


  subscribe(event, callback) {
    const self = this; // sync callback list

    if (!(event in self.events)) {
      self.events[event] = [];
    }

    return self.events[event].push(callback);
  }
  /**
   * Subscribe to specific event.
   *
   * @param {string} event - Event name to broadcast.
   * @param {object} payload - Arguments to pass to event callbacks.
   */


  publish(event, ...payload) {
    const self = this; // complete event chain if it exists

    if (!(event in self.events)) {
      return [];
    } // TODO: EMBED CALLBACKS IN TRY BLOCK?


    return self.events[event].map(callback => callback(...payload));
  }

}

/**
 * Helper methods.
 */
/**
 * Check if object is promise.
 */

function isPromise(obj) {
  return typeof obj !== 'undefined' && typeof obj.then === 'function';
}
/**
 * Check if object is function.
 */

function isFunction(obj) {
  return typeof obj === 'function';
}
/**
 * Check if object is array type.
 */

function isArray(obj) {
  return Array.isArray(obj);
}
/**
 * Check if object is plain object type.
 */

function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
/**
 * Check if object is undefined.
 */

function isUndefined(obj) {
  return typeof obj === 'undefined';
}
/**
 * Clone object recursively.
 */

function clone(obj) {
  if (isArray(obj)) {
    return obj.map(item => clone(item));
  } else if (isObject(obj)) {
    const result = {};
    Object.keys(obj).forEach(key => {
      result[key] = clone(obj[key]);
    });
    return result;
  } else {
    return obj;
  }
}
/**
 * Recursively check for object equality.
 */

function deepEqual(target, other) {
  // compare types
  if (typeof target !== typeof other) {
    return false;
  } // compare arrays


  if (isArray(target)) {
    if (target.length !== other.length) {
      return false;
    }

    for (let i = 0; i < target.length; i += 1) {
      if (!deepEqual(target[i], other[i])) {
        return false;
      }
    }

    return true; // compare objects
  } else if (isObject(target)) {
    const keys = Object.keys(target).sort();

    if (!deepEqual(keys, Object.keys(other).sort())) {
      return false;
    }

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];

      if (!deepEqual(target[key], other[key])) {
        return false;
      }
    }

    return true;
  } // compare values


  return target === other;
}

/**
 * Class for managing state during data reflection.
 */
/**
 * Event names constants for state changes.
 */

const status = {
  IDLE: 'idle',
  RESET: 'reset',
  ROLLBACK: 'rollback',
  UPDATE: 'update',
  COMMIT: 'commit',
  MUTATE: 'mutate',
  DISPATCH: 'dispatch'
};
/**
 * Class for managing state stack, allowing optional callback
 * to be issued when base state is reached.
 */

class StatusManager {
  /**
   * Constructor for object.
   *
   * @param {string} status - Base state for manager.
   * @param {function} callback - Callback to issue once base state is reached.
   */
  constructor(status, callback) {
    this.idle = status;
    this.stack = [status];

    this.callback = callback || function () {};
  }
  /**
   * Get current status.
   */


  get current() {
    return this.stack[this.stack.length - 1];
  }
  /**
   * Get current status.
   */


  get previous() {
    if (this.stack.length < 2) {
      return this.idle;
    } else {
      return this.stack[this.stack.length - 2];
    }
  }
  /**
   * Reset status manager back to idle.
   */


  reset() {
    this.stack = [this.idle];
    this.callback();
  }
  /**
   * Push new status onto stack.
   */


  push(status) {
    this.stack.push(status);
  }
  /**
   * Pop status off state stack and issue callback
   * if state manager has returned to resting.
   */


  pop() {
    let state;

    if (this.stack.length > 1) {
      state = this.stack.pop();

      if (this.stack.length === 1) {
        this.callback();
      }
    }

    return state;
  }

}
/**
 * Simple store helper for managing state in an application.
 */


class Store {
  /**
   * Create a new store helper.
   *
   * @param {object} params - Object with state, mutations, and
   *     actions to manage.
   */
  constructor(params = {}) {
    const self = this;
    params.state = params.state || {}; // set default options

    self.options = params.options || {
      type: 'transactional'
    }; // set from inputs

    self.mutations = {};
    Object.keys(params.state).forEach(key => {
      self.mutations[key] = (state, value) => {
        state[key] = value;
      };
    });
    Object.assign(self.mutations, params.mutations); // create actions proxy for better api

    self.actions = params.actions || {};
    self.apply = new Proxy(self.actions, {
      get(target, name) {
        if (name in target) {
          return (...payload) => self.dispatch(name, ...payload);
        }

        return undefined;
      }

    }); // getters proxy

    self.cache = {};
    self.getters = params.getters || {};
    self.get = new Proxy(self.getters, {
      get(target, name) {
        if (!(name in target)) {
          return undefined;
        }

        if (name in self.cache) {
          return self.cache[name];
        } else {
          const result = target[name](self.state);

          if (!isFunction(result)) {
            self.cache[name] = result;
          }

          return result;
        }
      }

    }); // initialize

    self.events = new PubSub();
    self.backup = clone(params.state); // create manager for status updates

    self.status = new StatusManager(status.IDLE, () => {
      self.events.publish(status.IDLE, self);
    }); // subscribe to specific state changes

    Object.keys(params.subscribe || {}).forEach(key => {
      self.events.subscribe(key, () => {
        params.subscribe[key]({
          state: self.stage,
          commit: self.commit,
          dispatch: self.dispatch
        });
        self.stage.commit();
      });
    }); // subscribe to events

    Object.keys(params.events || {}).forEach(key => {
      self.events.subscribe(key, (...payload) => {
        params.events[key]({
          state: self.stage,
          commit: self.commit,
          dispatch: self.dispatch
        }, ...payload);
        self.stage.commit();
      });
    }); // create proxy for state to publish events

    const state = clone(params.state);
    self.state = new Proxy(state, {
      get(target, key) {
        // return function to reset state and stage to initial value
        if (key === 'reset') {
          return name => {
            self.status.push(status.RESET); // reset single param

            if (!isUndefined(name) && name in self.backup) {
              const old = self.stage[name];
              self.stage[name] = clone(self.backup[name]);
              target[name] = clone(self.backup[name]);
              self.events.publish(name, self.stage[name], old, self); // reset everything
            } else {
              self.stage = Object.assign(self.stage, clone(self.backup));
              target = Object.assign(target, clone(self.backup)); // QUESTION: publish all specific state events?
            }

            self.cache = {};
            self.events.publish(status.RESET, self);
            self.status.pop();
          };
        }

        return target[key];
      },

      set(target, key, value) {
        // protect against state changes outside of mutations (strict mode)
        if (self.options.type === 'strict') {
          if (![status.MUTATE, status.RESET, status.COMMIT].includes(self.status.current)) {
            throw new Error(`State variable ${key} should not be directly set outside of mutation or action.`);
          }
        } // set value


        const old = target[key];
        self.status.push(status.UPDATE);
        target[key] = value;
        self.stage[key] = value; // emit after

        self.cache = {};
        self.events.publish(key, target[key], old, self);
        self.events.publish(status.UPDATE, key, target[key], old, self);
        self.status.pop();
        return true;
      }

    }); // create stage for state transactions

    self.stage = new Proxy(clone(state), {
      get(target, key) {
        if (key === 'rollback') {
          return name => {
            self.status.push(status.ROLLBACK); // reset single param

            if (!isUndefined(name) && name in self.backup) {
              target[name] = clone(self.state[name]); // reset everything
            } else {
              target = Object.assign(target, clone(self.state));
            }

            self.events.publish(status.ROLLBACK, self);
            self.status.pop();
          };
        } // return commit function to commit stage to current state


        if (key === 'commit') {
          return values => {
            // normalize inputs
            self.status.push(status.COMMIT);

            if (isObject(values)) {
              target = Object.assign(target, values);
            } else {
              values = target;
            } // commit new data


            const updated = [];
            Object.keys(values).forEach(key => {
              if (!deepEqual(state[key], values[key])) {
                state[key] = clone(values[key]);
                updated.push(key);
              }
            }); // cascade deletes

            Object.keys(state).forEach(key => {
              if (!(key in target)) {
                delete state[key];
              }
            }); // publish updates if necessary

            if (updated.length !== 0) {
              self.cache = {};
              updated.forEach(key => self.events.publish(key, self));
              self.events.publish(status.COMMIT, self);
            }

            self.status.pop();
          };
        }

        return target[key];
      },

      set(target, key, value) {
        target[key] = value;
        return true;
      }

    });
  }
  /**
   * Register new constructs with the store.
   *
   * @param {object} params - State constructs to register with store.
   */


  register(params) {
    Object.assign(this.state, params.state || {});
    Object.assign(this.getters, params.getters || {});
    Object.assign(this.actions, params.actions || {});
  }
  /**
   * Reset store back to base state.
   */


  reset() {
    this.state.reset();
  }
  /**
   * Proxy for subscribing to specific state changes
   *
   * @param {string} name - State parameter to subscribe to.
   * @param {object} callback - Callback to execute on state changes.
   */


  subscribe(name, callback) {
    const self = this;
    self.events.subscribe(name, callback);
  }
  /**
   * Commit change to store using mutation.
   *
   * @param {string} name - Name of mutation to commit.
   * @param {object} payload - Arguments for mutation.
   */


  commit(name, ...payload) {
    const self = this; // assert mutation exists

    if (typeof self.mutations[name] !== 'function') {
      throw new Error(`Mutation \`${name}\` does not exist.`);
    } // emit before and open transaction


    self.status.push(status.MUTATE); // issue mutation and update state

    let result;

    try {
      result = self.mutations[name](self.stage, ...payload);
      self.stage.commit();
      self.events.publish(status.MUTATE, name, ...payload, self); // reset to idle
    } finally {
      self.status.pop();
    }

    return result;
  }
  /**
   * Dispatch method for dispatching new actions managed by the store.
   *
   * @param {string} name - Name of action to dispatch.
   * @param {object} payload - Arguments for action.
   */


  async dispatch(name, ...payload) {
    const self = this; // assert action exists

    if (typeof self.actions[name] !== 'function') {
      throw new Error(`Action \`${name}\` does not exist.`);
    } // change status and open transaction


    self.status.push(status.DISPATCH); // dispatch and handle response

    let result;

    try {
      result = self.actions[name]({
        state: self.stage,
        commit: self.commit,
        dispatch: self.dispatch,
        get: self.get,
        apply: self.apply
      }, ...payload);

      if (!isPromise(result)) {
        if (self.status.previous === status.IDLE) {
          self.stage.commit();
          self.events.publish(status.DISPATCH, name, ...payload, self);
        }
      }
    } catch (err) {
      if (!isPromise(result)) {
        self.stage.rollback();
      }

      throw err;
    } finally {
      if (!isPromise(result)) {
        self.status.pop();
      }
    } // promise lifecycle


    if (isPromise(result)) {
      result = result.then(() => {
        if (self.status.previous === status.IDLE) {
          self.stage.commit();
          self.events.publish(status.DISPATCH, name, ...payload, self);
        }
      }).catch(err => {
        self.stage.rollback();
        throw err;
      }).finally(() => {
        self.status.pop();
      });
    }

    return result;
  }

}

/**
 * Placholder for proxy logic
 */
/**
 * List of array modifiers to dispatch callbacks on.
 */

const ARRAY_MODIFIERS = ['push', 'pop', 'shift', 'unshift', 'splice'];
/**
 * Abstract class for managing proxies with subscriptions.
 */

class PublishingProxy {
  constructor(callback) {
    // set up pubsub for object
    this.events = new PubSub();

    if (isFunction(callback)) {
      this.events.subscribe('update', callback);
      this.events.subscribe('delete', callback);
      this.events.subscribe('reset', callback);
    }
  }
  /**
   * Subscribe to object or specific data changes.
   *
   * @param {string} event - Event name to subscribe to. Can be
   *     before/after for global changes, or a specific
   *     data key name.
   * @param {function} callback - Callback to execute when event
   *     is published.
   */


  subscribe(event, callback) {
    // shorthand
    if (isFunction(event)) {
      this.events.subscribe('update', callback);
      this.events.subscribe('delete', callback);
      this.events.subscribe('reset', callback); // specific event
    } else if (isFunction(callback)) {
      this.events.subscribe(event, callback);
    }
  }
  /**
   * Publish global or specific event.
   *
   * @param {string} event - Event name to publish.
   * @param {array} payload - Payload to pass to nested events.
   */


  publish(event, ...payload) {
    this.events.publish(event, ...payload);
  }

}
/**
 * Class for creating nested proxies from object type.
 *
 * @param {object} target - Data to create nested proxy for.
 * @param {function} callback - Callback to execute after global
 *     update/delete events.
 */


class ObjectProxy extends PublishingProxy {
  constructor(target, callback, deep = true) {
    super(callback);
    const self = this; // create backup

    const backup = Object.assign({}, target); // proxify nested objects

    if (deep) {
      Object.keys(target).forEach(key => {
        if (isObject(target[key])) {
          target[key] = new ObjectProxy(target[key], callback);
        } else if (isArray(target[key])) {
          // eslint-disable-next-line no-use-before-define
          target[key] = new ArrayProxy(target[key], callback);
        }
      });
    } // return proxy with callbacks for modifiers


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
                delete obj[key];
              }
            });
            self.publish('reset');
          };
        } // handle proxy update (performance improvement vs Object.assign)


        if (prop === 'update') {
          // return update function
          return values => {
            // proxify nested objects
            if (deep) {
              Object.keys(values).forEach(key => {
                if (isObject(values[key])) {
                  values[key] = new ObjectProxy(values[key], callback);
                } else if (isArray(target[key])) {
                  // eslint-disable-next-line no-use-before-define
                  values[key] = new ArrayProxy(values[key], callback);
                }
              });
            } // assign data and publish


            obj = Object.assign(obj, values);
            self.publish('update');
          };
        } // handle proxy subscribe


        if (prop === 'subscribe') {
          return (key, callback) => {
            if (isFunction(key) && isUndefined(callback)) {
              self.subscribe('update', key);
            } else {
              self.subscribe(key, callback);
            }
          };
        }

        return obj[prop];
      },

      // setter with publish
      set(obj, prop, value) {
        if (isObject(value) && deep) {
          obj[prop] = new ObjectProxy(value, callback);
        } else if (isArray(value) && deep) {
          // eslint-disable-next-line no-use-before-define
          obj[prop] = new ArrayProxy(value, callback);
        } else {
          obj[prop] = value;
        }

        self.publish(prop);
        self.publish('update', prop, value);
        return true;
      },

      // delete with publish
      deleteProperty(obj, prop) {
        delete obj[prop];
        self.publish(prop);
        self.publish('delete', prop);
        return true;
      }

    });
  }

}
/**
 * Class for creating nested proxies from array type.
 *
 * @param {array} target - Data to create nested proxy for.
 * @param {function} callback - Callback to execute after global
 *     update/delete events.
 */


class ArrayProxy extends PublishingProxy {
  constructor(target, callback, deep = true) {
    super(callback);
    const self = this; // create semi-shallow clone for defaults

    const backup = target.map(x => {
      if (isObject(x)) {
        return Object.assign({}, x);
      } else if (isArray(x)) {
        return x.slice();
      }

      return x;
    }); // proxy nested data

    if (deep) {
      target = target.map(x => {
        if (isObject(x)) {
          return new ObjectProxy(x, callback);
        } else if (isArray(x)) {
          return new ArrayProxy(x, callback);
        }

        return x;
      });
    } // return proxy with callbacks for modifiers


    return new Proxy(target, {
      // get with publish for modifiers
      get(obj, prop) {
        // handle proxy reset
        if (prop === 'reset') {
          return () => {
            obj.splice(0, obj.length);
            obj.push(...backup);
            self.publish('reset');
          };
        } // handle proxy subscribe


        if (prop === 'subscribe') {
          return (key, callback) => {
            if (isFunction(key) && isUndefined(callback)) {
              self.subscribe('update', key);
            } else {
              self.subscribe(key, callback);
            }
          };
        } // handle function modifiers


        const value = obj[prop];

        if (typeof value === 'function') {
          // modifiers
          if (ARRAY_MODIFIERS.includes(prop)) {
            return (...args) => {
              const result = obj[prop](...args);
              self.publish(prop);
              self.publish('update');
              return result;
            };
          } // non-modifiers


          return value.bind(obj);
        }

        return value;
      },

      // set with publish
      set(obj, prop, value) {
        if (isObject(value) && deep) {
          obj[prop] = new ObjectProxy(value, callback);
        } else if (isArray(value) && deep) {
          obj[prop] = new ArrayProxy(value, callback);
        } else {
          obj[prop] = value;
        }

        self.publish(prop);
        self.publish('update', prop, value);
        return true;
      },

      // delete with publish
      deleteProperty(obj, prop) {
        obj.splice(prop, 1);
        self.publish(prop);
        self.publish('delete', prop);
        return true;
      }

    });
  }

}
/**
 * Observable class for watching nested data changes and issuing
 * before/after callbacks.
 */


class Observable {
  /**
   * Create new Observable object.
   *
   * @param {object} target - Data to create nested proxy for.
   * @param {function} callback - Callback to execute after global
   *     update/delete events.
   */
  constructor(target, callback) {
    // normalize inputs
    target = target || {}; // array

    if (isArray(target)) {
      return new ArrayProxy(target, callback); // object
    } else if (isObject(target)) {
      return new ObjectProxy(target, callback); // other
    } else {
      throw new Error('Cannot create Observable type for non Array or Object type.');
    }
  }

} // exports

/**
 * Main entry point for module
 */
var index = {
  Store,
  Observable
};

module.exports = index;
