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
test("actions.base", async () => {
  assert.isTrue(true);
  assert.equal(store.status, 'idle');
});

test("actions.rollback", async () => {
  // assert action works with right call
  await store.dispatch('multiply', 1);
  assert.equal(store.state.counter, 1);

  // assert rollback
  try {
    await store.dispatch('multiply', 2);
    assert.fail('Rollback testing action should have failed.');
  } catch (err) {
    assert.equal(store.state.counter, 2);
  }
});

test("actions.backups", async () => {
  // test for staged rollback operations
  assert.isTrue(true);
});

test("actions.register", async () => {
  // dynamic action registration
  assert.isTrue(true);
});
