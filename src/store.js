/**
 * Class for managing state during data reflection.
 */


// imports
import PubSub from './pubsub';
import {
  isFunction, isPromise, isObject, clone,
} from './utils';


/**
 * Event names constants for state changes.
 */
const status = {
  IDLE: 'idle',
  RESET: 'reset',
  ROLLBACK: 'rollback',
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
      recurse: false,
    };

    // register constructs
    self.stage = {};
    self.state = {};
    self.actions = {};
    self.getters = {};
    self.mutations = {};
    self.register(params);

    // set from inputs
    Object.keys(params.state).forEach((key) => {
      self.mutations[key] = (state, value) => {
        state[key] = value;
      };
    });
    Object.assign(self.mutations, params.mutations);

    // create actions proxy for better api
    self.apply = new Proxy(self.actions, {
      get(target, name) {
        if (name in target) {
          return (...payload) => self.dispatch(name, ...payload);
        }
        return undefined;
      },
    });

    // getters proxy
    self.cache = {};
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
      },
    });

    // initialize
    self.events = new PubSub();
    self.backup = clone(params.state);

    // create manager for status updates
    self.status = new StatusManager(status.IDLE, () => {
      self.events.publish(status.IDLE, self.state);
    });

    // subscribe to events
    Object.keys(params.events || {}).forEach(key => self.subscribe(key, params.events[key]));
  }

  /**
   * Register new constructs with the store.
   *
   * @param {object} params - State constructs to register with store.
   */
  register(params) {
    Object.assign(this.state, clone(params.state) || {});
    Object.assign(this.stage, clone(params.state) || {});
    Object.assign(this.getters, params.getters || {});
    Object.assign(this.actions, params.actions || {});
    Object.assign(this.mutations, params.mutations || {});

    // detect state shape
    this.nested = [];
    Object.keys(this.state).forEach((key) => {
      if (isObject(this.state[key])) {
        this.nested.push(key);
      }
    });
  }

  /**
   * Reset store back to base state.
   *
   * @param {string} key - State param to reset in store.
   */
  reset(key) {
    const self = this;
    self.status.push(status.RESET);
    if (typeof key === 'undefined') {
      self.state = clone(self.backup);
      self.stage = clone(self.backup);
    } else {
      self.state[key] = clone(self.backup[key]);
      self.stage[key] = clone(self.backup[key]);
    }
    self.events.publish(status.RESET);
    self.status.pop();
  }

  /**
   * Flush state changes from stage to store. This
   * method is called after the end of an action or mutation
   * to safely update the store on callable success.
   *
   * @param {boolean} publish - Whether or not to publish a `commit`
   *     event after this method is called.
   */
  flush(publish = true) {
    const self = this;
    if (publish) {
      self.status.push(status.COMMIT);
    }

    // push the changes to state
    if (self.options.recurse) {
      self.state = clone(self.stage);

    // if top-level is index
    } else if (self.nested.length === 0) {
      self.state = { ...self.stage };

    // nested items with index
    } else {

      // cascade updates
      Object.keys(self.stage).forEach((key) => {
        if (self.nested.includes(key)) {
          self.state[key] = { ...self.stage[key] };
        } else {
          self.state[key] = self.stage[key];
        }
      });

      // cascade deletes
      Object.keys(self.state).forEach((key) => {
        if (!(key in self.stage)) {
          delete self.state[key];
        }
      });
    }

    // reset getters cache
    self.cache = {};

    // publish updates if specfied
    if (publish) {
      self.events.publish(status.COMMIT);
      self.status.pop();
    }
  }

  /**
   * Rollback staged changes and update stage with state. This
   * method is called after the end of an action or mutation
   * to safely rollback the store on callable success.
   *
   * @param {boolean} publish - Whether or not to publish a `rollback`
   *     event after this method is called.
   */
  rollback(publish = true) {
    const self = this;
    if (publish) {
      self.status.push(status.ROLLBACK);
    }

    // push the changes to state
    self.stage = clone(self.state);

    // publish updates if specfied
    if (publish) {
      self.events.publish(status.ROLLBACK);
      self.status.pop();
    }
  }

  /**
   * Proxy for subscribing to specific state changes
   *
   * @param {string} name - State parameter to subscribe to.
   * @param {object} callback - Callback to execute on state changes.
   */
  subscribe(name, callback) {
    const self = this;

    // check validity
    const values = Object.values(status);
    if (!(values.includes(name))) {
      const choices = values.join(', ');
      throw new Error(`Cannot subscribe to \`${name}\`. Valid choices are: ${choices}`);
    }

    // subscribe
    self.events.subscribe(name, (...payload) => {
      callback(self.stage, ...payload);
      self.flush(false);
    });
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
      self.flush();
      self.events.publish(status.MUTATE, name, ...payload);

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
        flush: () => self.flush(false),
        dispatch: self.dispatch,
        get: self.get,
        apply: self.apply,
      }, ...payload);
      if (!isPromise(result)) {
        if (self.status.previous === status.IDLE) {
          self.flush();
          self.events.publish(status.DISPATCH, name, ...payload);
        }
      }
    } catch (err) {
      if (!isPromise(result)) {
        self.rollback();
      }
      throw err;
    } finally {
      if (!isPromise(result)) {
        self.status.pop();
      }
    }

    // promise lifecycle
    if (isPromise(result)) {
      result = result.then(() => {
        if (self.status.previous === status.IDLE) {
          self.flush();
          self.events.publish(status.DISPATCH, name, ...payload);
        }
      }).catch((err) => {
        self.rollback();
        throw err;
      }).finally(() => {
        self.status.pop();
      });
    }

    return result;
  }
}

export default Store;
