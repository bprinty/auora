/**
 * Performance testing for package.
 */


// imports
// -------
import { assert } from 'chai';
import Store from '../src/store';


// config
// ------
const store = new Store({
  state: {},
  getters: {
    exists: state => id => id in state,
    all: state => Object.values(state),
    one: state => id => state[id],
    head: state => {
      const keys = Object.keys(state);
      if (keys.length === 0) {
        return 0;
      }
      return Math.max(...keys);
    },
  },
  actions: {
    sync({ state, get }, payload) {
      // update if data exists
      if ('id' in payload) {
        state[payload.id] = Object.assign(state[payload.id] || {}, payload);

        // otherwise, create new index and add to store
      } else {
        payload.id = get.head + 1;
        state[payload.id] = Object.assign({}, payload);
      }
      return state[payload.id];
    },
    remove({ state }, id) {
      delete state[id];
    },
  },
});


// fixtures
// --------
beforeEach(() => {
  store.reset();
});


// tests
// -----
test("performance.create", async () => {
  const iterations = 1000;
  const start = Date.now();
  const data = {};
  for(let i = 0; i < iterations; i += 1) {
    store.apply.sync({ foo: 'bar' });
  }
  const delta = Date.now() - start;
  console.log(`Store: ${delta} ms`);
});

test("performance.update", async () => {
  const iterations = 1000;

  // fill state
  for(let i = 0; i < iterations; i += 1) {
    store.apply.sync({ foo: 'bar' });
  }

  // time updates
  const start = Date.now();
  for(let i = 0; i < iterations; i += 1) {
    store.apply.sync({ id: i + 1, foo: 'bar' });
  }
  const delta = Date.now() - start;
  console.log(`Store: ${delta} ms`);
});

test("performance.remove", async () => {
  // fill state
  for(let i = 0; i < iterations; i += 1) {
    store.apply.sync({ foo: 'bar' });
  }

  // time remove
  const start = Date.now();
  for(let i = 0; i < iterations; i += 1) {
    store.apply.remove(i + 1);
  }
  const delta = Date.now() - start;
  console.log(`Store: ${delta} ms`);
});
