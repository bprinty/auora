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
test("declare.mutations", async () => {
  assert.equal(store.state.counter, 0);

  // // simple mutations
  // store.commit('increment');
  // assert.equal(store.state.counter, 1);
  // assert.equal(store.status, 'idle');
  //
  // // mutations with arguments
  // store.commit('add', 2);
  // assert.equal(store.state.counter, 3);
  // assert.equal(store.status, 'idle');
});


test("declare.actions", async () => {
  assert.equal(store.state.counter, 0);
  //
  // // sync actions
  // store.dispatch('syncAdd', 2);
  // assert.equal(store.state.counter, 2);
  // assert.equal(store.status, 'idle');
  //
  // // async actions
  // await store.dispatch('syncAdd', 2);
  // assert.equal(store.state.counter, 4);
  // assert.equal(store.status, 'idle');
});
