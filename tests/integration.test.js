/**
 * Integration testing with complex store.
 */


// imports
// -------
import { assert } from 'chai';
import Store from '../src/store';


// fixtures
// --------
const nested = new Store({
  state: {
    data: {},
  },
  getters: {
    model: state => id => state.data[id],
    collection: state => Object.values(state.data),
  },
  actions: {
    create({ state }, payload, error = false) {
      const id = Object.keys(state.data).length + 1;
      payload.id = id;
      state.data[id] = Object.assign({}, payload);
      if (error) {
        throw new Error('Error adding new model to collection.');
      }
      return payload;
    },
    update({ state }, payload, error = false) {
      const id = payload.id;
      state.data[id] = Object.assign({}, state.data[id], payload);
      if (error) {
        throw new Error('Error updating existing model.');
      }
      return state.data[id];
    },
    delete({ state }, id, error = false) {
      delete state.data[id];
      if (error) {
        throw new Error('Error deleting existing model.');
      }
    },
  },
});

const flat = new Store({
  state: {},
  getters: {
    model: state => id => state[id],
    collection: state => Object.values(state),
  },
  actions: {
    create({ state }, payload, error = false) {
      const id = Object.keys(state).length + 1;
      payload.id = id;
      state[id] = Object.assign({}, payload);
      if (error) {
        throw new Error('Error adding new model to collection.');
      }
      return payload;
    },
    update({ state }, payload, error = false) {
      const id = payload.id;
      state[id] = Object.assign({}, state[id], payload);
      if (error) {
        throw new Error('Error updating existing model.');
      }
      return state[id];
    },
    delete({ state }, id, error = false) {
      delete state[id];
      if (error) {
        throw new Error('Error deleting existing model.');
      }
    },
  },
});

beforeEach(() => {
  nested.reset();
  flat.reset();
});


// tests
// -----
test("nested.crud", async () => {
  // assert empty
  assert.isTrue(Object.keys(nested.state.data).length === 0);

  // create
  const obj = { foo: 'bar' };
  nested.apply.create(obj);
  assert.isTrue(Object.keys(nested.state.data).length === 1);

  // read
  assert.deepEqual(nested.get.model(1), obj);
  assert.deepEqual(nested.get.collection, [{ id: 1, foo: 'bar' }]);

  // update
  nested.apply.update({ id: 1, foo: 'baz' });
  assert.isTrue(Object.keys(nested.state.data).length === 1);
  assert.deepEqual(nested.get.model(1), { id: 1, foo: 'baz' });

  // delete
  nested.apply.delete(1);
  assert.isTrue(Object.keys(nested.state.data).length === 0);
});

test("nested.errors", async () => {
  // assert empty
  assert.isTrue(Object.keys(nested.state.data).length === 0);

  // create error
  const obj = { foo: 'bar' };
  try {
    await nested.apply.create(obj, true);
  } catch (e) {
    // noop
  }
  assert.isTrue(Object.keys(nested.state.data).length === 0);
  assert.isTrue(Object.keys(nested.stage.data).length === 0);

  // seed for downstream test
  nested.apply.create(obj);
  assert.deepEqual(nested.get.model(1), obj);

  // update
  try {
    await nested.apply.update({ id: 1, foo: 'baz' }, true);
  } catch (e) {
    // noop
  }
  assert.deepEqual(nested.get.model(1), { id: 1, foo: 'bar' });
  assert.equal(nested.stage.data[1].foo, 'bar');

  // delete
  try {
    await nested.apply.delete(1, true);
  } catch (e) {
    // noop
  }
  assert.deepEqual(nested.get.model(1), { id: 1, foo: 'bar' });
  assert.isTrue(Object.keys(nested.state.data).length === 1);
  assert.isTrue(Object.keys(nested.stage.data).length === 1);
});


test("flat.crud", async () => {
  // assert empty
  assert.isTrue(Object.keys(flat.state).length === 0);

  // create
  const obj = { foo: 'bar' };
  flat.apply.create(obj);
  assert.isTrue(Object.keys(flat.state).length === 1);

  // read
  assert.deepEqual(flat.get.model(1), obj);
  assert.deepEqual(flat.get.collection, [{ id: 1, foo: 'bar' }]);

  // update
  flat.apply.update({ id: 1, foo: 'baz' });
  assert.isTrue(Object.keys(flat.state).length === 1);
  assert.deepEqual(flat.get.model(1), { id: 1, foo: 'baz' });

  // delete
  flat.apply.delete(1);
  assert.isTrue(Object.keys(flat.state).length === 0);
});

test("flat.errors", async () => {
  // assert empty
  assert.isTrue(Object.keys(flat.state).length === 0);

  // create error
  const obj = { foo: 'bar' };
  try {
    await flat.apply.create(obj, true);
  } catch (e) {
    // noop
  }
  assert.isTrue(Object.keys(flat.state).length === 0);
  assert.isTrue(Object.keys(flat.stage).length === 0);

  // seed for downstream test
  flat.apply.create(obj);
  assert.deepEqual(flat.get.model(1), obj);

  // update
  try {
    await flat.apply.update({ id: 1, foo: 'baz' }, true);
  } catch (e) {
    // noop
  }
  assert.deepEqual(flat.get.model(1), { id: 1, foo: 'bar' });
  assert.equal(flat.stage[1].foo, 'bar');

  // delete
  try {
    await flat.apply.delete(1, true);
  } catch (e) {
    // noop
  }
  assert.deepEqual(flat.get.model(1), { id: 1, foo: 'bar' });
  assert.isTrue(Object.keys(flat.state).length === 1);
  assert.isTrue(Object.keys(flat.stage).length === 1);
});
