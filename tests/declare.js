/**
 * Testing for declarative store syntax.
 */


// imports
// -------
import Store from '../src/store';


// config
// ------
export default new Store({
  counter: {
    default: 0,
    mutations: {
      increment: value => value + 1,
      add: (value, number) => value + number,
    },
    actions: {
      add(value, number) {
        return new Promise((resolve) => {
          resolve(value + number);
        });
      },
    },
  },
});
