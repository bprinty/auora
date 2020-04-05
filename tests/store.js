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
    counter: 0,
    array: [
      { id: 1, foo: 'bar' },
    ],
    object: {
      foo: 'bar',
    },
  },
  mutations: {
    increment(state) {
      state.counter += 1;
    },
    add(state, number) {
      state.counter += number;
    },
  },
  actions: {
    // sync action
    subtract(store, number) {
      const result = store.state.counter - number;
      store.commit('counter', result);
      return result;
    },

    // async action
    add(store, number) {
      return new Promise((resolve) => {
        const result = store.state.counter + number;
        store.commit('counter', result);
        resolve(result);
      });
    },

    // failing action
    multiply(store, number, error = false) {
      return new Promise((resolve, reject) => {
        const value = store.state.counter;
        for (let i = 1; i < number; i += 1) {
          store.commit('add', value);
          if (error) {
            reject(new Error());
          }
        }
        resolve();
      });
    },
  },
});
