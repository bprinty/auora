/**
 * Testing for package.
 */

// TODO: TESTING FOR
// 1. STAGE RESET AFTER ACTION ERROR
// 1. STORE RESET SPECIFIC STATE PROPERTY


// imports
// -------
import { assert } from 'chai';
import store from './store';


// fixtures
// --------
beforeEach(() => {
  store.reset();
});


// tests
// -----
test("actions.simple", async () => {
  assert.equal(store.state.counter, 0);
  assert.equal(store.state.status, 'off');
  assert.equal(store.status.current, 'idle');

  // sync action
  store.apply.increment();
  assert.equal(store.state.counter, 1);
  assert.equal(store.status.current, 'idle');

  // async action
  await store.apply.add(5);
  assert.equal(store.status.current, 'idle');
  assert.equal(store.state.counter, 6);

  // async action with updates
  await store.apply.multiply(2);
  assert.equal(store.state.counter, 12);
  assert.equal(store.status.current, 'idle');
});

test("actions.concurrent", async () => {
  assert.equal(store.state.counter, 0);
  assert.equal(store.state.status, 'off');

  // sync action
  store.apply.increment();
  assert.equal(store.state.counter, 1);

  // async with updates
  const promise = store.apply.multiply(2);
  assert.equal(store.state.counter, 1);
  assert.equal(store.state.status, 'on');

  // resolve and check result
  await promise;
  assert.equal(store.state.counter, 2);
  assert.equal(store.state.status, 'off');
});

test("actions.nested", async () => {
  assert.equal(store.state.counter, 0);
  assert.equal(store.state.status, 'off');

  // nested action
  await store.apply.add(2);
  await store.apply.square();

  assert.equal(store.state.counter, 4);
  assert.deepEqual(store.state.operations, ['add', 'square']);
  assert.deepEqual(store.state.history, [0, 2, 4]);
  assert.equal(store.state.status, 'off');
});

test("state.updates", async () => {
  assert.equal(store.state.counter, 0);
  const noop = store.state.noop;
  const counter = store.state.counter;
  const history = store.state.history;
  const operations = store.state.operations;

  // assert state updates are visible
  store.apply.increment();
  assert.equal(noop, store.state.noop);
  assert.notEqual(counter, store.state.counter);
  assert.notEqual(history, store.state.history);
  assert.notEqual(operations, store.state.operations);
});

test("state.deletes", async () => {
  // make sure state prop exists
  assert.isTrue(typeof store.state.noop !== 'undefined');

  // shake it off and make sure it's gone
  store.apply.shake();
  assert.isTrue(typeof store.state.noop === 'undefined');
});

test("getters.simple", async () => {
  assert.equal(store.state.counter, 0);
  assert.equal(store.state.status, 'off');
  assert.equal(store.status.current, 'idle');

  // apply action
  store.apply.increment();
  assert.equal(store.state.counter, 1);
  assert.equal(store.status.current, 'idle');

  // getter
  assert.equal(store.get.first, 0);
  assert.equal(store.status.current, 'idle');

  // check caching
  store.cache.first = 5;
  assert.equal(store.get.first, 5);
  store.apply.increment();
  assert.equal(store.get.first, 0);

  // check with arguments
  assert.equal(store.get.record(1), 0);
});

test("store.commit", async () => {
  assert.equal(store.state.counter, 0);

  // auto-generated mutations
  store.commit('counter', 2);
  assert.equal(store.state.counter, 2);

  // explicit mutations
  store.commit('subtract', 1);
  assert.equal(store.state.counter, 1);

});

test("store.dispatch", async () => {
  assert.equal(store.state.counter, 0);
  assert.equal(store.state.status, 'off');
  assert.equal(store.status.current, 'idle');

  // sync action
  store.dispatch('increment');
  assert.equal(store.state.counter, 1);
  assert.equal(store.status.current, 'idle');

  // async action
  await store.dispatch('add', 5);
  assert.equal(store.status.current, 'idle');
  assert.equal(store.state.counter, 6);
});

test("store.register", async () => {
  // assert unregistered
  assert.isTrue(typeof store.state.registered === 'undefined');
  assert.isTrue(typeof store.apply.setCount === 'undefined');
  assert.isTrue(typeof store.get.getCount === 'undefined');

  // register new constructs
  store.register({
    state: {
      registered: true,
    },
    getters: {
      getCount: state => state.counter,
    },
    actions: {
      setCount({ state }, value) {
        state.counter = value;
      },
    },
  });

  // assert registered to store
  assert.isTrue(typeof store.state.registered !== 'undefined');
  assert.isTrue(typeof store.apply.setCount !== 'undefined');
  assert.isTrue(typeof store.get.getCount !== 'undefined');
});
