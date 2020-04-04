/**
 * Class for managing state during data reflection.
 */


// TODO -- FIGURE OUT HOW TO MANAGE TRANSACTIONS FOR SIMULTANEOUS ASYNC ACTIONS
// 1. Action 1 dispatch -> create backup 1
// 2. Action 2 dispatch
// 3. Action 1 finish -> update backup to result after action 1 finishes.
// 4. Action 2 errors
// 5. Rollback to beginning of action 1.
//
// Might need to manage full (throughout execution) 1. active store, 2. backup store, 3. default store

import { isEmpty, isObject, isFunction, isPromise, isUndefined } from './utils';


/**
 * Event names constants for state changes.
 */
const status = {
  IDLE: 'idle',
  RESET: 'reset',
  ROLLBACK: 'rollback',
  UPDATE: 'update',
  MUTATE: 'mutate',
  ACTION: 'action',
};


/**
 * Default mutation
 */
function setState(key) {
  return (state, value) => {
    state[key] = value;
  };
}

function resetState(key, value) {
  return (state) => {
    state[key] = value;
  };
}

function syncState(key) {
  return (state, id, value) => {
    // array
    if (isArray(state[key])) {

      // normalize inputs
      let input = id;
      if (!isArray(input)) {
        input = [input];
      }

      // traverse inputs and process
      input.map(item => {
        if (!isObject(item) || !('id' in item)) {
          throw new Error('Cannot use `sync` for array state without indexed object inputs');
        }

        // go through state and update item
        let updated = false;
        for (let idx=0; idx < state[key].length; idx += 1) {
          if (isObject(state[key][idx]) && 'id' in state[key][idx]) {
            if (state[key][idx].id === item.id) {
              state[key][idx] = Object.assign(state[key][idx], item);
              updated = true;
              break;
            }
          }
        }

        // push onto state if not an update
        if (!updated) {
          state[key].push(item);
        }
      });

    // object
    } else if (isObject(state[key])) {

      // normalize inputs
      let input = {};
      if (isObject(id)) {
        input = id;
      } else {
        input[id] = value;
      }

      // go through keys and process update
      Object.keys(input).forEach(k => {
        const v = input[k];

        // handle nested object
        if (isObject(state[key][k]) && isObject(v)) {
          state[key][k] = Object.assign(state[key][k], v);
        }

        // no nested object
        else {
          state[key][k] = v;
        }
      });

    // other
    } else {
      throw new Error('Cannot use `update` mutation for non Array/Object types.');
    }
  };
}

function addState(key) {
  return (state, ...args) => {
    // array
    if (isArray(state[key])) {
      console.log('update');

    // object
    } else if (isObject(state[key])) {
      console.log('update');

    // other
    } else {
      throw new Error('Cannot use `add` mutation for non Array/Object types.');
    }
  };
}

function removeState(key) {
  return (state, ...args) => {
    // array
    if (isArray(state[key])) {
      console.log('update');

    // object
    } else if (isObject(state[key])) {
      console.log('update');

    // other
    } else {
      throw new Error('Cannot use `add` mutation for non Array/Object types.');
    }
  };
}


/**
 * Simple store helper for managing state in an application.
 */
export default class Store {
  /**
   * Create a new store helper.
   *
   * @param {object} params - Object with state, mutations, and
   *     actions to manage.
   */
  constructor(params = {}) {
    const self = this;

    // set from inputs
    self.mutations = params.mutations || {};
    self.actions = params.actions || {};
    self.options = params.options || {

      // TODO: FIGURE OUT HOW TO INCLUDE ROLLBACKS IN ACTIONS THAT
      //       COMMIT ONE OR MULTIPLE TIMES TO THE STORE
      rollback: true,
    };

    // default mutations
    Object.keys(params.state).forEach((key) => {
      self.mutations[key] = setState(key);
      self.mutations[`${key}.reset`] = resetState(key, params.state[key]);
      self.mutations[`${key}.sync`] = syncState(key);
      self.mutations[`${key}.add`] = addState(key);
      self.mutations[`${key}.remove`] = removeState(key);
    });

    // initialize
    self.status = status.IDLE;
    self.events = new PubSub();
    self.defaults = Object.assign({}, params.state);
    self.backup = {};

    // create proxy for state helper
    self.state = new Proxy(params.state || {}, {
      set: (state, key, value) => {
        const before = self.status;

        // protect against state changes outside of mutations
        if (![status.MUTATE, status.RESET, status.ROLLBACK].includes(self.status)) {
          throw new Error(`State variable ${key} should not be directly set outside of mutation.`);
        }

        // set value
        self.status = status.UPDATE;
        state[key] = value;

        // emit after
        self.events.publish(`state-${key}`);
        self.events.publish(status.UPDATE);
        self.status = before;
        return true;
      },
    });
  }

  /**
   * Proxy for subscribing to events tracked by store.
   * @param {string} event - Event name to broadcast.
   * @param {object} payload - Arguments to pass to event callbacks.
   */
  subscribe(event, callback) {
    const self = this;
    self.events.subscribe(event, callback);
  }

  /**
   * Proxy for subscribing to specific action tracked by store.
   * @param {string} state - State variable to subscribe to.
   * @param {object} payload - Arguments to pass to event callbacks.
   */
  subscribeState(state, callback) {
    const self = this;
    self.events.subscribe(`state-${state}`, callback);
  }

  /**
   * Proxy for subscribing to specific action tracked by store.
   * @param {string} mutation - Mutation name to subscribe to.
   * @param {object} payload - Arguments to pass to event callbacks.
   */
  subscribeMutation(mutation, callback) {
    const self = this;
    self.events.subscribe(`mutation-${mutation}`, callback);
  }

  /**
   * Proxy for subscribing to specific action tracked by store.
   * @param {string} action - Action name to subscribe to.
   * @param {object} payload - Arguments to pass to event callbacks.
   */
  subscribeAction(action, callback) {
    const self = this;
    self.events.subscribe(`action-${action}`, callback);
  }

  /**
   * Begin transaction, saving state backup information.
   */
  begin() {
    const self = this;

    // copy current state for potential rollback
    self.backup = {};
    Object.keys(self.state).forEach((key) => {
      self.backup[key] = self.state[key];
    });
  }

  /**
   * Close transaction, changing state back to idle status.
   */
  close() {
    const self = this;
    self.status = status.IDLE;
    self.backup = {};
    self.events.publish(status.IDLE);
  }


  /**
   * Reset all store values back to initial state.
   */
  reset() {
    const self = this;
    this.status = status.RESET;
    self.state = Object.assign(self.state, this.defaults);
    self.events.publish(status.RESET);
    self.close();
  }

  /**
   * Rollback state data to internal backup.
   */
  rollback() {
    const self = this;
    const before = self.status;
    if (self.options.rollback && !isEmpty(self.backup)) {
      self.status = status.ROLLBACK;
      self.state = Object.assign(self.state, self.backup);
      self.backup = {};
      self.events.publish(status.ROLLBACK);
      self.status = before;
    }
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
      throw new Error(`Action ${name} does not exist.`);
    }

    // change status and open transaction
    self.status = status.ACTION;
    self.begin();

    // dispatch and handle response
    let result;
    try {
      result = self.actions[name](self, ...payload);

    // catch sync error and rollback
    } catch (err) {
      self.rollback();
      throw err;

    // close transaction
    } finally {
      if (!isPromise(result)) {
        self.events.publish(`action-${name}`);
        self.events.publish(status.ACTION);
        self.close();
      }
    }

    // handle async results
    if (isPromise(result)) {
      result.catch(() => {
        self.rollback();
      }).finally(() => {
        self.events.publish(`action-${name}`);
        self.events.publish(status.ACTION);
        self.close();
      });
    }

    return result;
  }


  /**
   * Commit change to store using mutation.
   *
   * @param {string} name - Name of mutation to commit.
   * @param {object} payload - Arguments for mutation.
   */
  commit(name, ...payload) {
    const self = this;
    const before = self.status;

    // assert mutation exists
    if (typeof self.mutations[name] !== 'function') {
      throw new Error(`Mutation ${name} does not exist.`);
    }

    // emit before and open transaction
    self.status = status.MUTATE;

    // issue mutation and update state
    let result;
    try {
      result = self.mutations[name](self.state, ...payload);
      self.state = Object.assign(self.state, result);

    // handle exception and rollback
    } catch (err) {
      throw err;

    // close transaction
    } finally {
      self.events.publish(`mutation-${name}`);
      self.events.publish(status.MUTATE);
      self.status = before;
      if (self.status === status.IDLE) {
        self.events.publish(status.IDLE);
      }
    }
    return result;
  }
}
