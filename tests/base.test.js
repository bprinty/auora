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
test("base.defaults", async () => {
  assert.equal(store.defaults.counter, 0);
  assert.deepEqual(store.defaults.array, [{ id: 1, foo: 'bar' }]);
  assert.deepEqual(store.defaults.object, { bar: 'baz' });
});

test("base.mutations", async () => {
  assert.equal(store.state.counter, 0);

  // simple mutations
  store.commit('increment');
  assert.equal(store.state.counter, 1);
  assert.equal(store.status, 'idle');

  // mutations with arguments
  store.commit('add', 2);
  assert.equal(store.state.counter, 3);
  assert.equal(store.status, 'idle');

  // default
  store.commit('counter', 0);
  assert.equal(store.state.counter, 0);
  assert.equal(store.status, 'idle');
});

test("base.automatic", async () => {
  assert.equal(store.state.counter, 0);

  // setter
  store.commit('counter', 5);
  assert.equal(store.state.counter, 5);

  store.commit('array', [null]);
  assert.deepEqual(store.state.array, [null]);

  store.commit('object', { bar: 'baz' });
  assert.deepEqual(store.state.object, { bar: 'baz' });

  // reset
  store.commit('counter', 0);
  assert.equal(store.state.counter, store.defaults.counter);

  store.commit('array.reset');
  assert.deepEqual(store.state.array, store.defaults.array);

  store.commit('object.reset', { foo: 'bar' });
  assert.deepEqual(store.state.object, store.defaults.object);

  // sync
  store.commit('array.sync', { id: 1, foo: 'baz' });
  assert.deepEqual(store.state.array, [{ id: 1, foo: 'baz' }]);
  store.commit('array.sync', [
    { id: 1, foo: 'foo' },
    { id: 2, baz: 'foo' },
  ]);
  assert.deepEqual(store.state.array, [
    { id: 1, foo: 'foo' },
    { id: 2, baz: 'foo' },
  ]);

  store.commit('object.sync', 'foo', 'baz');
  assert.deepEqual(store.state.object, { foo: 'baz' });
  store.commit('object.sync', { foo: 'bar', baz: 'foo' });
  assert.deepEqual(store.state.object, { foo: 'bar', baz: 'foo' });

  // add
  store.reset();
  store.commit('array.add', { id: 2, bar: 'baz' });
  assert.deepEqual(store.state.array, [
    { id: 1, foo: 'bar' },
    { id: 2, bar: 'baz' }
  ]);
  store.commit('array.add', [
    { id: 3, a: 'b' },
    { id: 4, c: 'd' },
  ]);
  assert.equal(store.state.array.length, 4);

  store.commit('object.add', 'bar', 'baz');
  assert.deepEqual(store.state.object, { foo: 'bar', bar: 'baz' });
  store.commit('object.sync', { foo: 'bar', baz: 'foo' });
  assert.deepEqual(store.state.object, { foo: 'bar', baz: 'foo' });

  // remove


});

test("base.actions", async () => {
  assert.equal(store.state.counter, 0);

  // sync actions
  store.dispatch('syncAdd', 2);
  assert.equal(store.state.counter, 2);
  assert.equal(store.status, 'idle');

  // async actions
  await store.dispatch('syncAdd', 2);
  assert.equal(store.state.counter, 4);
  assert.equal(store.status, 'idle');
});

test("base.errors", async () => {
  // assert direct state change
  try {
    store.state.counter = 5;
    assert.fail('Direct state change should throw error.');
  } catch (err) {
    assert.isTrue(/state variable counter/.test(err.message.toLowerCase()));
  }
});
