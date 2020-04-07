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
test("events.defined", async () => {
  assert.deepEqual(store.state.counter, 0);
  assert.deepEqual(store.state.history, [0]);
  assert.deepEqual(store.state.operations, []);

  // state
  store.state.counter = 1;
  assert.deepEqual(store.state.counter, 1);
  assert.deepEqual(store.state.history, [0, 1]);
  assert.deepEqual(store.state.operations, []);

  // mutation
  store.commit('counter', 2);
  assert.deepEqual(store.state.counter, 2);
  assert.deepEqual(store.state.history, [0, 1, 2]);
  assert.deepEqual(store.state.operations, []);

  // sync action
  store.apply.increment();
  assert.deepEqual(store.state.counter, 3);
  assert.deepEqual(store.state.history, [0, 1, 2, 3]);
  assert.deepEqual(store.state.operations, ['increment']);

  // async action
  await store.apply.add(1);
  assert.deepEqual(store.state.counter, 4);
  assert.deepEqual(store.state.history, [0, 1, 2, 3, 4]);
  assert.deepEqual(store.state.operations, ['increment', 'add']);
});

test("events.after", async () => {
  let chain = [store.status.current];
  const record = () => {
    chain.push(store.status.current);
  };
  store.subscribe('idle', record);
  store.subscribe('reset', record);
  store.subscribe('update', record);
  store.subscribe('commit', record);
  store.subscribe('mutate', record);
  store.subscribe('dispatch', record);

  // mutation (commit for counter, history)
  chain = [store.status.current];
  store.commit('counter', 1);
  assert.deepEqual(chain, ['idle', 'commit', 'commit', 'mutate', 'idle']);
  assert.equal(store.status.current, 'idle');

  // sync action (commit for counter, history, and operations)
  chain = [store.status.current];
  store.apply.increment();
  assert.deepEqual(chain, ['idle', 'commit', 'commit', 'commit', 'dispatch', 'idle']);
  assert.equal(store.status.current, 'idle');

  // async action (commit for counter, history, and operations)
  chain = [store.status.current];
  await store.apply.add(1);
  assert.deepEqual(chain, ['idle', 'commit', 'commit', 'commit', 'dispatch', 'idle']);
  assert.equal(store.status.current, 'idle');

  // reset (no commit)
  chain = [store.status.current];
  store.reset();
  assert.deepEqual(chain, ['idle', 'reset', 'idle']);
  assert.equal(store.status.current, 'idle');
});

//
// test("events.before", async () => {
//   let chain = [store.status];
//   const record = () => {
//     chain.push(store.status);
//   };
//   store.subscribe('before-reset', record);
//   store.subscribe('before-rollback', record);
//   store.subscribe('before-update', record);
//   store.subscribe('before-mutate', record);
//   store.subscribe('before-action', record);
//
//   // mutation
//   chain = [store.status];
//   store.commit('increment');
//   assert.deepEqual(chain, ['idle', 'mutate', 'update']);
//   assert.equal(store.status, 'idle');
//
//   // action
//   chain = [store.status];
//   store.dispatch('subtract', 1);
//   assert.deepEqual(chain, ['idle', 'action', 'mutate', 'update']);
//   assert.equal(store.status, 'idle');
//
//   // async action
//   chain = [store.status];
//   await store.dispatch('add', 1);
//   assert.deepEqual(chain, ['idle', 'action', 'mutate', 'update', 'idle']);
//   assert.equal(store.status, 'idle');
//
//   // rollback
//   chain = [store.status];
//   try {
//     await store.dispatch('multiply', 2);
//     assert.fail('Action should have thrown exception.');
//   } catch (err) {
//     assert.deepEqual(chain, ['idle', 'action', 'mutate', 'update', 'rollback', 'idle']);
//     assert.equal(store.status, 'idle');
//   }
// });

test("events.specific", async () => {
  let count = 0;
  const increment = () => {
    count += 1;
  };
  store.subscribe('counter', increment);
  store.subscribe('add', increment);

  // state only
  store.state.counter = 1;
  assert.equal(count, 1);

  // mutation
  store.commit('counter', 2);
  assert.equal(count, 2);

  // action
  await store.dispatch('add', 1);
  assert.equal(count, 3);
});
