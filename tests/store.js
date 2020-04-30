/**
 * Testing for package.
 */


// imports
// -------
import Store from '../src/store';


// config
// ------
export default new Store({
  state: {
    status: 'off',
    counter: 0,
    history: [0],
    operations: [],
    noop: {},
  },
  getters: {
    first(state) {
      return state.history[0];
    },
    record(state) {
      return index => state.history[index - 1];
    },
  },
  mutations: {
    subtract(state, value) {
      state.counter -= value;
    },
  },
  actions: {
    // sync action
    increment({ state }) {
      state.counter += 1;
      return state.counter;
    },

    // async action
    add({ state }, number) {
      return new Promise((resolve) => {
        state.counter += number;
        resolve(state.counter);
      });
    },

    // async action with status update
    multiply({ state }, fold) {
      state.commit({ status: 'on' });
      return new Promise((resolve) => {
        state.counter *= fold;
        resolve(state.counter);
      }).finally(() => {
        state.status = 'off';
      });
    },

    // delete unecessary items from store (testing delete)
    shake({ state }) {
      delete state.noop;
    },

    // action to test action chaining
    square({ state, apply }) {
      return apply.multiply(state.counter).then();
    },
  },
  subscribe: {
    counter({ state }) {
      state.history.push(state.counter);
    },
  },
  events: {
    // update
    // commit
    dispatch({ state }, name) {
      state.operations.push(name);
    },
  },
});
