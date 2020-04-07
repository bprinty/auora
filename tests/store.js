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
  mutations: {
    subtract(state, value) {
      state.counter -= value;
    }
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
        state.counter = state.counter + number;
        resolve(state.counter);
      });
    },

    // async action with status update
    multiply({ state }, fold) {
      state.commit({ status: 'on' });
      return new Promise((resolve) => {
        state.counter = state.counter * fold;
        resolve(state.counter);
      }).finally(() => {
        state.status = 'off';
      });
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
    dispatch({ state }, name, ...inputs) {
      state.operations.push(name);
    }
  }
});
