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
test("events.after", async () => {
  let chain = [store.status];
  const record = () => {
    chain.push(store.status);
  };
  store.subscribe('idle', record);
  store.subscribe('reset', record);
  store.subscribe('rollback', record);
  store.subscribe('update', record);
  store.subscribe('mutate', record);
  store.subscribe('action', record);

  // mutation
  chain = [store.status];
  store.commit('increment');
  assert.deepEqual(chain, ['idle', 'update', 'mutate', 'idle']);
  assert.equal(store.status, 'idle');

  // action
  chain = [store.status];
  store.dispatch('syncAdd', 1);
  assert.deepEqual(chain, ['idle', 'update', 'mutate', 'action', 'idle']);
  assert.equal(store.status, 'idle');

  // async action
  chain = [store.status];
  await store.dispatch('asyncAdd', 1);
  assert.deepEqual(chain, ['idle', 'update', 'mutate', 'action', 'idle']);
  assert.equal(store.status, 'idle');

  // rollback
  chain = [store.status];
  try {
    await store.dispatch('doubleAdd', 1, true);
    assert.fail('Action should have thrown exception.');
  } catch (err) {
    assert.deepEqual(chain, ['idle', 'update', 'mutate', 'update', 'rollback', 'action', 'idle']);
    assert.equal(store.status, 'idle');
  }

  // complex
  chain = [store.status];
  await store.dispatch('doubleAdd', 1);
  assert.deepEqual(chain, ['idle', 'update', 'mutate', 'update', 'mutate', 'action', 'idle']);
  assert.equal(store.status, 'idle');
});


test("events.before", async () => {
  let chain = [store.status];
  const record = () => {
    chain.push(store.status);
  };
  store.subscribe('before-reset', record);
  store.subscribe('before-rollback', record);
  store.subscribe('before-update', record);
  store.subscribe('before-mutate', record);
  store.subscribe('before-action', record);

  // mutation
  chain = [store.status];
  store.commit('increment');
  assert.deepEqual(chain, ['idle', 'mutate', 'update']);
  assert.equal(store.status, 'idle');

  // action
  chain = [store.status];
  store.dispatch('subtract', 1);
  assert.deepEqual(chain, ['idle', 'action', 'mutate', 'update']);
  assert.equal(store.status, 'idle');

  // async action
  chain = [store.status];
  await store.dispatch('add', 1);
  assert.deepEqual(chain, ['idle', 'action', 'mutate', 'update', 'idle']);
  assert.equal(store.status, 'idle');

  // rollback
  chain = [store.status];
  try {
    await store.dispatch('multiply', 2);
    assert.fail('Action should have thrown exception.');
  } catch (err) {
    assert.deepEqual(chain, ['idle', 'action', 'mutate', 'update', 'rollback', 'idle']);
    assert.equal(store.status, 'idle');
  }
});


test("events.specific", async () => {
  let count = 0;
  const increment = () => {
    count += 1;
  };
  store.subscribeState('counter', increment);
  store.subscribeMutation('increment', increment);
  store.subscribeAction('syncAdd', increment);

  // state only
  await store.dispatch('asyncAdd', 1);
  assert.equal(count, 1);

  // state + mutation
  store.commit('increment');
  assert.equal(count, 3);

  // action + state
  store.dispatch('syncAdd', 1);
  assert.equal(count, 5);
});

// test("events.detect", async() => {
//   let count = 0;
//   const increment = () => {
//     count += 1;
//   };
//   store.subscribe('counter', increment);
//   store.subscribe('increment', increment);
//   store.subscribe('syncAdd', increment);
//
//   // state only
//   await store.dispatch('asyncAdd', 1);
//   assert.equal(count, 1);
//
//   // state + mutation
//   store.commit('increment');
//   assert.equal(count, 3);
//
//   // action + state
//   store.dispatch('syncAdd', 1);
//   assert.equal(count, 5);
// });
