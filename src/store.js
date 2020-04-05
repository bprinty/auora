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
  UPDATE: 'update',
  COMMIT: 'commit',
  DISPATCH: 'dispatch',
};



class StateProxy {
  constructor(state) {
    const self = this;
    self.$state = state;
    self.$backup = deepClone(state);
    self.$stage = deepClone(state);
    return new Proxy(this, {
      get: (obj, key) => {
        if (key in self.$stage) {
          return self.$stage[key];
        }
        return obj[key];
      },
      set: (obj, key, value) => {
        self.$stage[key] = value;
        return true;
      }
    })
  }

  /**
   * Sync clone with current data in store.
   */
  sync() {
    self.$stage = Object.assign(self.$stage, deepClone(self.$state));
  }

  /**
   * Reset transaction data back into state of initial clone.
   */
  reset() {
    self.$stage = Object.assign(self.$stage, deepClone(self.$backup));
  }

  /**
   * Commit changes to store. If no object is specified,
   * this method will commit the current state of the state
   * clone to the store and refresh the clone. If an object,
   * is specified, that object will be committed to the state and
   * the clone simultaneously.
   *
   * @param {object} values - Values to commit to state.
   */
  commit(values) {
    // save input values in stage before commit
    if (isObject(values)) {
      self.$stage = Object.assign(self.$stage, values);

    // set comittable values to current stage
    } else {
      values = self.$stage
    }

    // commit to state
    self.$state = Object.assign(self.$state, deepClone(values));
  }
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

    // set default options
    self.options = params.options || {
      type: 'transactional',
    };

    // set from inputs
    self.mutations = params.mutations || {};

    // create actions proxy
    self.actions = new Proxy(params.actions || {}, {
      get(obj, name) {
        if (name in obj) {
          return (...payload) => {
            return obj[name](self, ...payload);
          }
        }
      }
    });

    // initialize
    self.status = status.IDLE;
    self.events = new PubSub();
    self.defaults = Object.assign({}, params.state);

    // create proxy for state to publish events
    self.state = new Proxy(params.state || {}, {
      // get: (state, key) => {
      //   if (key === 'commit') {
      //     return (payload) => {
      //       state = Object.assign({})
      //     }
      //   }
      // },
      set: (state, key, value) => {
        const before = self.status;

        // protect against state changes outside of mutations (strict mode)
        if (self.options.type === 'strict') {
          if (![status.COMMIT, status.RESET].includes(self.status)) {
            throw new Error(`State variable ${key} should not be directly set outside of mutation.`);
          }
        }

        // set value
        self.status = status.UPDATE;
        state[key] = value;

        // emit after
        self.events.publish(status.UPDATE);
        self.status = before;
        return true;
      },
    });

    // create stage for state transactions
    self.stage = StateProxy(self.state);
  }

  /**
   * Proxy for subscribing to events tracked by store.
   *
   * @param {string} event - Event name to broadcast.
   * @param {object} payload - Arguments to pass to event callbacks.
   */
  subscribe(event, callback) {
    const self = this;
    self.events.subscribe(event, callback);
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
    self.status = status.COMMIT;

    // issue mutation and update state
    if (this.stage === null) {
      this.stage = self.state.clone();
    }
    let result;
    try {
      result = self.mutations[name](this.stage, ...payload);
      this.stage.commit();

    // handle exception and rollback
    } catch (err) {
      throw err;

    // close transaction
    } finally {
      self.events.publish(status.COMMIT);
      self.status = before;
      if (self.status === status.IDLE) {
        self.stage = null;
        self.events.publish(status.IDLE);
      }
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
      throw new Error(`Action ${name} does not exist.`);
    }

    // change status and open transaction
    self.status = status.ACTION;
    const localState = self.state.clone();

    // dispatch and handle response
    let result;
    try {
      result = self.actions[name](...payload);

      // handle async results
      if (isPromise(result)) {
        result.catch(() => {
          self.rollback();
        }).finally(() => {
          self.events.publish(status.DISPATCH);
          self.close();
        });
      } else {
        localState.commit();
      }

    // catch sync error and rollback
    } catch (err) {
      self.rollback();
      throw err;

    // close transaction
    } finally {
      if (!isPromise(result)) {
        self.events.publish(status.DISPATCH);
        self.close();
      }
    }



    return result;
  }
}
