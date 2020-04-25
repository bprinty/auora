/**
 * Class for managing state during data reflection.
 */


// imports
import { PubSub } from './pubsub';
import { isEmpty, isObject, isFunction, isPromise, isUndefined, deepEqual, clone } from './utils';


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
  DISPATCH: 'dispatch',
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
    this.callback = callback || function(){};
  }

  /**
   * Get current status.
   */
  get current() {
    return this.stack[this.stack.length - 1];
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
    if (this.stack.length > 1) {
      this.stack.pop()
      if (this.stack.length === 1) {
        this.callback();
      }
    }
  }
}



/**
 * Simple store helper for managing state in an application.
 */
export class Store {
  /**
   * Create a new store helper.
   *
   * @param {object} params - Object with state, mutations, and
   *     actions to manage.
   */
  constructor(params = {}) {
    const self = this;
    params.state = params.state || {};

    // set default options
    self.options = params.options || {
      type: 'transactional',
    };

    // set from inputs
    self.mutations = {};
    Object.keys(params.state).forEach((key) => {
      self.mutations[key] = (state, value) => {
        state[key] = value;
      }
    });
    self.mutations = Object.assign(self.mutations, params.mutations);

    // create actions proxy for better api
    self.actions = params.actions || {};
    self.apply = new Proxy(self.actions, {
      get(target, name) {
        if (name in target) {
          return (...payload) => {
            return self.dispatch(name, ...payload);
          }
        }
      }
    });

    // getters proxy
    self.cache = {};
    params.getters = params.getters || {};
    self.get = new Proxy(params.getters, {
      get(target, name) {
        if (!(name in target)) {
          throw new Error(`No getter defined with name \`${name}\``);
        }
        if (name in self.cache) {
          return self.cache[name];
        } else {
          let result = target[name](self.state);
          if (!isFunction(result)) {
            self.cache[name] = result;
          }
          return result;
        }
      }
    });
    self.getters = self.get; // parity with other libraries

    // initialize
    self.events = new PubSub();
    self.backup = clone(params.state);

    // create manager for status updates
    self.status = new StatusManager(status.IDLE, () => {
      self.events.publish(status.IDLE, self);
    });

    // subscribe to specific state changes
    Object.keys(params.subscribe || {}).forEach(key => {
      self.events.subscribe(key, () => {
        params.subscribe[key]({
          state: self.stage,
          commit: self.commit,
          dispatch: self.dispatch
        });
        self.stage.commit();
      });
    });

    // subscribe to events
    Object.keys(params.events || {}).forEach(key => {
      self.events.subscribe(key, (...payload) => {
        params.events[key]({
          state: self.stage,
          commit: self.commit,
          dispatch: self.dispatch
        }, ...payload);
        self.stage.commit();
      });
    });

    // create proxy for state to publish events
    let state = clone(params.state);
    self.state = new Proxy(state, {
      get(target, key) {
        // return function to reset state and stage to initial value
        if (key === 'reset') {
          return (name) => {
            self.status.push(status.RESET);

            // reset single param
            if (!isUndefined(name) && name in self.backup) {
              const old = self.stage[name];
              self.stage[name] = clone(self.backup[name]);
              target[name] = clone(self.backup[name]);
              self.events.publish(name, self.stage[name], old, self);

            // reset everything
            } else {
              self.stage = Object.assign(self.stage, clone(self.backup));
              target = Object.assign(target, clone(self.backup));

              // QUESTION: publish all specific state events?
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
        }

        // set value
        const old = target[key];
        self.status.push(status.UPDATE);
        target[key] = value;
        self.stage[key] = value;

        // emit after
        self.cache = {};
        self.events.publish(key, target[key], old, self);
        self.events.publish(status.UPDATE, key, target[key], old, self);
        self.status.pop();
        return true;
      },
    });

    // create stage for state transactions
    self.stage = new Proxy(clone(state), {
      get(target, key) {
        if (key === 'rollback') {
          return (name) => {
            self.status.push(status.ROLLBACK);

            // reset single param
            if (!isUndefined(name) && name in self.backup) {
              target[name] = clone(self.state[name]);

            // reset everything
            } else {
              target = Object.assign(target, clone(self.state));
            }

            self.events.publish(status.ROLLBACK, self);
            self.status.pop();
          }
        }
        // return commit function to commit stage to current state
        if (key === 'commit') {
          return (values) => {

            // normalize inputs
            self.status.push(status.COMMIT);
            if (isObject(values)) {
              target = Object.assign(target, values);
            } else {
              values = target;
            }

            // commit new data only
            const updated = [];
            Object.keys(values).forEach((key) => {
              if (!deepEqual(state[key], values[key])) {
                state[key] = clone(values[key]);
                updated.push(key);
              }
            });

            // publish updates if necessary
            if (updated.length !== 0) {
              self.cache = {};
              updated.map((key) => {
                self.events.publish(key, self);
              });
              self.events.publish(status.COMMIT, self);
            }
            self.status.pop();
          }
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
    const self = this;

    // assert mutation exists
    if (typeof self.mutations[name] !== 'function') {
      throw new Error(`Mutation \`${name}\` does not exist.`);
    }

    // emit before and open transaction
    self.status.push(status.MUTATE);

    // issue mutation and update state
    let result;
    try {
      result = self.mutations[name](self.stage, ...payload);
      self.stage.commit();
      self.events.publish(status.MUTATE, name, ...payload, self);

    // reset to idle
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
    const self = this;

    // assert action exists
    if (typeof self.actions[name] !== 'function') {
      throw new Error(`Action \`${name}\` does not exist.`);
    }

    // change status and open transaction
    self.status.push(status.DISPATCH);

    // dispatch and handle response
    let result;
    try {
      result = self.actions[name]({
        state: self.stage,
        commit: self.commit,
        dispatch: self.dispatch,
        getters: self.getters,
        get: self.get,
        apply: self.apply,
      }, ...payload);
      if (!isPromise(result)) {
        self.stage.commit();
        self.events.publish(status.DISPATCH, name, ...payload, self);
      }
    } catch (err) {
      if (!isPromise(result)) {
        self.stage.rollback();
      }
      throw err;
    }finally {
      if (!isPromise(result)) {
        self.status.pop();
      }
    }

    // promise lifecycle
    if (isPromise(result)) {
      result = result.then(() => {
        self.stage.commit();
        self.events.publish(status.DISPATCH, name, ...payload, self);
      }).catch((err) => {
        self.stage.rollback();
        throw err;
      }).finally(() => {
        self.status.pop();
      });
    }

    return result;
  }
};

export default Store;
