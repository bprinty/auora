/**
 * Testing for package.
 */


// imports
// -------
import { assert } from 'chai';
import Store from '../src/store';


// config
// ------
const store = new Store({
  state: {
    counter: 0,
  },
  mutations: {
    reset(state) {
      state.counter = 0;
    },
    increment(state) {
      state.counter += 1;
    },
    add(state, number) {
      state.counter += number;
    },
  },
  actions: {
    syncAdd(store, number) {
      store.commit('add', number);
    },
    asyncAdd(store, number) {
      return new Promise((resolve) => {
        store.commit('add', number);
        resolve();
      });
    },
    doubleAdd(store, number, error = false) {
      return new Promise((resolve, reject) => {
        store.commit('add', number);
        if (error) {
          reject(new Error());
          return;
        }
        store.commit('add', number);
        resolve();
      });
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
describe("store", () => {

  test("store.actions", async () => {
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

  test("store.mutations", async () => {
    assert.equal(store.state.counter, 0);

    // simple mutations
    store.commit('increment');
    assert.equal(store.state.counter, 1);
    assert.equal(store.status, 'idle');

    // mutations with arguments
    store.commit('add', 2);
    assert.equal(store.state.counter, 3);
    assert.equal(store.status, 'idle');
  });

  test("store.errors", async () => {
    // assert direct state change
    try {
      store.state.counter = 5;
      assert.fail('Direct state change should throw error.');
    } catch (err) {
      assert.isTrue(/state variable counter/.test(err.message.toLowerCase()));
    }
  });

  test("store.rollback", async () => {
    // assert action works
    await store.dispatch('doubleAdd', 1);
    assert.equal(store.state.counter, 2);
    assert.equal(store.status, 'idle');

    // assert rollback
    try {
      await store.dispatch('doubleAdd', 1, true);
      assert.fail('Rollback testing action should have failed.');
    } catch (err) {
      assert.equal(store.state.counter, 2);
      assert.equal(store.status, 'idle');
    }
  });

});


describe("events", () => {

  test("events.global", async () => {
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

});
