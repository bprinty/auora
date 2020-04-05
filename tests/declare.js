/**
 * Testing for declarative store syntax.
 */


// imports
// -------
import Store from '../src/store';


// config
// ------
export default new Store({
  history: [0],
  operations: [],
  counter: {
    default: 0,
    actions: {
      increment(value) {
        return value + 1;
      },
      add(value, number) {
        return new Promise((resolve) => {
          resolve(value + number);
        });
      },
      multiply(value, fold) {
        return new Promise((resolve) => {
          resolve(value * fold);
        });
      }
    },
    subscribe({ state }) {
      state.history.push(state.counter);
    },
    events: {
      dispatch({ state }, name) {
        state.operations.push(name);
      }
    }
  }
});
