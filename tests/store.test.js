/**
 * Testing for package.
 */


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

  // sync action
  store.actions.increment();
  assert.equal(store.state.counter, 1);

  // async action
  await store.actions.add(5);
  assert.equal(store.state.counter, 6);

  // async action with updates
  await store.actions.multiply(2);
  assert.equal(store.state.counter, 12);
  assert.equal(store.state.status, 'idle');
});

test("actions.concurrent", async () => {
  assert.equal(store.state.counter, 0);
  assert.equal(store.state.status, 'off');

  // sync action
  store.actions.increment();
  assert.equal(store.state.counter, 1);

  // async with updates
  const promise = store.actions.multiply(2);
  assert.equal(store.state.counter, 1);
  assert.equal(store.state.status, 'running');

  // resolve and check result
  promise.resolve();
  assert.equal(store.state.counter, 2);
  assert.equal(store.state.status, 'idle');
});

test("state.updates", async () => {
  assert.equal(store.state.counter, 0);
  const counter = store.state.counter;
  const history = store.state.history;
  const operations = store.state.operations;

  // assert state updates are visible
  store.actions.increment();
  assert.notEqual(original, store.state.counter);
  assert.notEqual(history, store.state.history);
  assert.notEqual(operations, store.state.operations);
});

// // tests
// // -----
// test("actions.base", async () => {
//   assert.isTrue(true);
//   assert.equal(store.status, 'idle');
// });
//
// test("actions.rollback", async () => {
//   // assert action works with right call
//   await store.dispatch('multiply', 1);
//   assert.equal(store.state.counter, 1);
//
//   // assert rollback
//   try {
//     await store.dispatch('multiply', 2);
//     assert.fail('Rollback testing action should have failed.');
//   } catch (err) {
//     assert.equal(store.state.counter, 2);
//   }
// });
//
// test("actions.backups", async () => {
//   // test for staged rollback operations
//   assert.isTrue(true);
// });
//
// test("actions.register", async () => {
//   // dynamic action registration
//   assert.isTrue(true);
// });
