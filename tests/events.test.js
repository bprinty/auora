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

  // direct state change (no tracking)
  store.state.counter = 1;
  assert.deepEqual(store.state.counter, 1);
  assert.deepEqual(store.state.history, [0]);
  assert.deepEqual(store.state.operations, []);

  // mutation
  store.commit('counter', 2);
  assert.deepEqual(store.state.counter, 2);
  assert.deepEqual(store.state.history, [0, 2]);
  assert.deepEqual(store.state.operations, []);

  // sync action
  store.apply.increment();
  assert.deepEqual(store.state.counter, 3);
  assert.deepEqual(store.state.history, [0, 2, 3]);
  assert.deepEqual(store.state.operations, ['increment']);

  // async action
  await store.apply.add(1);
  assert.deepEqual(store.state.counter, 4);
  assert.deepEqual(store.state.history, [0, 2, 3, 4]);
  assert.deepEqual(store.state.operations, ['increment', 'add']);
});

test("events.subscribe", async () => {
  let chain = [store.status.current];
  const record = () => {
    chain.push(store.status.current);
  };
  store.subscribe('idle', record);
  store.subscribe('reset', record);
  store.subscribe('commit', record);
  store.subscribe('mutate', record);
  store.subscribe('dispatch', record);

  // mutation (commit for counter, history)
  chain = [store.status.current];
  store.commit('counter', 1);
  assert.deepEqual(chain, ['idle', 'commit', 'mutate', 'idle']);
  assert.equal(store.status.current, 'idle');

  // sync action
  chain = [store.status.current];
  store.apply.increment();
  assert.deepEqual(chain, ['idle', 'commit', 'dispatch', 'idle']);
  assert.equal(store.status.current, 'idle');

  // async action
  chain = [store.status.current];
  await store.apply.add(1);
  assert.deepEqual(chain, ['idle', 'commit', 'dispatch', 'idle']);
  assert.equal(store.status.current, 'idle');

  // reset (no commit)
  chain = [store.status.current];
  store.reset();
  assert.deepEqual(chain, ['idle', 'reset', 'idle']);
  assert.equal(store.status.current, 'idle');
});
