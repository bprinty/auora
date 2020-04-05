/**
 * Testing for package.
 */


// imports
// -------
import { assert } from 'chai';
import { Observable } from '../src/proxy';


// tests
// -----
test("observable.array", async () => {

  const track = [];
  const obj = new Observable([{ id: 1, foo: 'bar' }], (key, value) => {
    track.push({ key, value });
  });

  // default
  assert.deepEqual(obj, [{ id: 1, foo: 'bar' }]);

  // simple change
  obj[0].foo = 'baz';
  assert.equal(track.length, 1);
  assert.deepEqual(track[0], { key: 'foo', value: 'baz' });
  assert.deepEqual(obj, [{ id: 1, foo: 'baz' }]);

  // new value
  obj[1] = { id: 2, foo: 'foo' };
  assert.equal(track.length, 2);
  assert.deepEqual(track[1], { key: '1', value: { id: 2, foo: 'foo' } });
  assert.deepEqual(obj, [{ id: 1, foo: 'baz' }, { id: 2, foo: 'foo' }]);

  // new nested object
  obj[1].foo = 'test';
  assert.equal(track.length, 3);
  assert.deepEqual(track[2], { key: 'foo', value: 'test' });
  assert.deepEqual(obj, [{ id: 1, foo: 'baz' }, { id: 2, foo: 'test' }]);

  // delete
  delete obj[1]
  assert.equal(track.length, 4);
  assert.deepEqual(track[3], { key: '1', value: undefined });
  assert.deepEqual(obj, [{ id: 1, foo: 'baz' }]);

  // pop
  const data = obj.pop();
  assert.equal(track.length, 5);
  assert.deepEqual(track[4], { key: undefined, value: undefined });
  assert.deepEqual(obj, []);

  // reset
  obj.reset()
  assert.equal(track.length, 6);
  assert.deepEqual(track[5], { key: undefined, value: undefined });
  assert.deepEqual(obj, [{ id: 1, foo: 'bar' }]);
});

test("observable.array.performance", async () => {
  const template = [
    { id: 1, foo: 'bar' },
    { id: 2, foo: 'baz' },
  ];

  // setting properties
  function timeSetting(obj, iter = 100000) {
    const start = Date.now();
    for(let i=0; i<iter; i+=1) {
      obj[1].foo = i + 'test';
    }
    const delta = Date.now() - start;
    return delta;
  }

  const setRaw = timeSetting(template.slice());
  const setObs = timeSetting(new Observable(template.slice()));
  console.log('array setter slowdown', (setObs / setRaw));
  assert.isTrue((setObs / setRaw) < 30); // less than 30x slower

  // creating properties
  function createSetting(obj, iter = 100000) {
    const start = Date.now();
    for(let i=0; i<iter; i+=1) {
      obj[i] = { id: i, foo: i + 'test' };
    }
    const delta = Date.now() - start;
    return delta;
  }

  const createRaw = timeSetting(template.slice());
  const createObs = timeSetting(new Observable(template.slice()));
  console.log('array create slowdown', (createObs / createRaw));
  assert.isTrue((createObs / createRaw) < 50); // less than 40x slower

});

test("observable.object", async () => {
  const track = [];
  const obj = new Observable({ foo: 'bar', arr: [] }, (key, value) => {
    track.push({ key, value });
  });

  // default
  assert.deepEqual(obj, { foo: 'bar', arr: [] });

  // simple change
  obj.foo = 'baz';
  assert.equal(track.length, 1);
  assert.deepEqual(track[0], { key: 'foo', value: 'baz' });
  assert.deepEqual(obj, { foo: 'baz', arr: [] });

  // new value
  obj.bar = { baz: 'foo' };
  assert.equal(track.length, 2);
  assert.deepEqual(track[1], { key: 'bar', value: { baz: 'foo' } });
  assert.deepEqual(obj, { foo: 'baz', arr: [], bar: { baz: 'foo'} });

  // nested object
  obj.bar.baz = 'test';
  assert.equal(track.length, 3);
  assert.deepEqual(track[2], { key: 'baz', value: 'test' });
  assert.deepEqual(obj, { foo: 'baz', arr: [], bar: { baz: 'test'} });

  // nested array
  obj.arr.push(1)
  assert.equal(track.length, 4);
  assert.deepEqual(track[3], { key: undefined, value: undefined });
  assert.deepEqual(obj, { foo: 'baz', arr: [1], bar: { baz: 'test' } });

  // delete
  delete obj.bar
  assert.equal(track.length, 5);
  assert.deepEqual(track[4], { key: 'bar', value: undefined });
  assert.deepEqual(obj, { foo: 'baz', arr: [1] });

  // proto
  obj.update({
    foo: 'test',
    bar: 'a',
  });
  assert.equal(track.length, 6);
  assert.deepEqual(track[5], { key: undefined, value: undefined });
  assert.deepEqual(obj, { foo: 'test', arr: [1], bar: 'a' });

  // reset
  obj.reset()
  assert.equal(track.length, 7);
  assert.deepEqual(track[6], { key: undefined, value: undefined });
  assert.deepEqual(obj, { foo: 'bar', arr: [] });

});

test("observable.object.performance", async () => {
  const template = {
    1: { id: 1, foo: 'bar' },
    2: { id: 2, foo: 'baz' },
  };

  // setting properties
  function timeSetting(obj, iter = 100000) {
    const start = Date.now();
    for(let i=0; i<iter; i+=1) {
      obj[1].foo = i + 'test';
    }
    const delta = Date.now() - start;
    return delta;
  }

  const setRaw = timeSetting(Object.assign({}, template));
  const setObs = timeSetting(new Observable(Object.assign({}, template)));
  console.log('object setter slowdown', (setObs / setRaw));
  assert.isTrue((setObs / setRaw) < 50); // less than 30x slower

  // creating properties
  function createSetting(obj, iter = 100000) {
    const start = Date.now();
    for(let i=0; i<iter; i+=1) {
      obj[i] = { id: i, foo: i + 'test' };
    }
    const delta = Date.now() - start;
    return delta;
  }

  const createRaw = createSetting(Object.assign({}, template));
  const createObs = createSetting(new Observable(Object.assign({}, template)));
  console.log('object create slowdown', (createObs / createRaw));
  assert.isTrue((createObs / createRaw) < 40); // less than 40x slower

});
