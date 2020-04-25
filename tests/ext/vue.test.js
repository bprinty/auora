/**
 * Testing for package.
 */


// imports
// -------
import { assert } from 'chai';
import store from '../store';
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Auora from '../../src/ext/vue';


// fixtures
// --------
beforeEach(() => {
  store.reset();
});


// tests
// -----
describe('vue.global', () => {

  const Counter = {
    template: '<div>{{ count }}</div>',
    state: {
      count: 'counter',
    },
    getters: {
      initial: 'first',
    },
    actions: {
      localIncrement: 'increment',
    },
  };

  const History = {
    template: '<div><p v-for="item in history" :key="item">{{ item }}</p></div>',
    state: ['history'],
    getters: ['first'],
    actions: ['increment', 'add'],
  };

  const Noop = {
    template: '<span>{{ history.length }}</span>',
    state: '*',
    actions: true,
    mutations: true,
    getters: true,
    methods: {
      localIncrement: store.apply.increment,
    }
  };

  const localVue = createLocalVue();
  localVue.use(Auora);

  test("vue.global.setup", async () => {

    // rename
    const counter = shallowMount(Counter, {
      localVue,
      store,
    });
    assert.equal(counter.vm.count, 0);
    assert.equal(counter.vm.initial, 0);
    assert.isFunction(counter.vm.localIncrement);

    // standard
    const history = shallowMount(History, {
      localVue,
      store,
    });
    assert.equal(history.vm.first, 0);
    assert.deepEqual(history.vm.history, [0]);
    assert.isFunction(history.vm.increment);
    assert.isFunction(history.vm.add);

    // global
    const noop = shallowMount(Noop, {
      localVue,
      store,
    });
    assert.equal(noop.vm.first, 0);
    assert.deepEqual(noop.vm.counter, 0);
    assert.deepEqual(noop.vm.history, [0]);
    assert.isFunction(noop.vm.increment);
    assert.isFunction(noop.vm.add);
    assert.isFunction(noop.vm.subtract);
  });

  test("vue.global.updates", async () => {
    const wrapper = shallowMount(Noop, {
      localVue,
      store,
    });
    assert.equal(wrapper.vm.counter, 0);
    assert.deepEqual(wrapper.vm.history, [0]);

    // globally action
    store.apply.increment();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 1);
    assert.deepEqual(wrapper.vm.history, [0, 1]);

    // mapped renamed actions
    wrapper.vm.localIncrement();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 2);
    assert.deepEqual(wrapper.vm.history, [0, 1, 2]);

    // mapped actions
    wrapper.vm.increment();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 3);
    assert.deepEqual(wrapper.vm.history, [0, 1, 2, 3]);

    // mapped mutations
    wrapper.vm.increment();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 4);
    assert.deepEqual(wrapper.vm.history, [0, 1, 2, 3, 4]);
  });

});


describe('vue.module', () => {

  const Counter = {
    template: '<div>{{ count }}</div>',
    state: {
      common: {
        count: 'counter',
      }
    },
    getters: {
      common: {
        initial: 'first',
      },
    },
    actions: {
      common: {
        localIncrement: 'increment',
      }
    },
  };

  const History = {
    template: '<div><p v-for="item in history" :key="item">{{ item }}</p></div>',
    state: {
      common: ['history'],
    },
    getters: {
      common: ['first'],
    },
    actions: {
      common: ['increment', 'add'],
    },
  };

  const Noop = {
    template: '<span>{{ history.length }}</span>',
    state: {
      common: '*',
    },
    actions: {
      common: true
    },
    getters: {
      common: true
    },
    mutations: {
      common: true
    },
    methods: {
      localIncrement: store.apply.increment,
    }
  };

  const localVue = createLocalVue();
  localVue.use(Auora);

  test("vue.module.setup", async () => {

    // rename
    const counter = shallowMount(Counter, {
      localVue,
      store: { common: store },
    });
    assert.equal(counter.vm.count, 0);
    assert.equal(counter.vm.initial, 0);
    assert.isFunction(counter.vm.localIncrement);

    // standard
    const history = shallowMount(History, {
      localVue,
      store: { common: store },
    });
    assert.equal(history.vm.first, 0);
    assert.deepEqual(history.vm.history, [0]);
    assert.isFunction(history.vm.increment);
    assert.isFunction(history.vm.add);

    // global
    const noop = shallowMount(Noop, {
      localVue,
      store: { common: store },
    });
    assert.equal(noop.vm.counter, 0);
    assert.equal(noop.vm.first, 0);
    assert.deepEqual(noop.vm.history, [0]);
    assert.isFunction(noop.vm.increment);
    assert.isFunction(noop.vm.add);
    assert.isFunction(noop.vm.subtract);
  });

  test("vue.module.updates", async () => {
    const wrapper = shallowMount(Noop, {
      localVue,
      store: { common: store },
    });
    assert.equal(wrapper.vm.counter, 0);
    assert.deepEqual(wrapper.vm.history, [0]);

    // globally action
    store.apply.increment();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 1);
    assert.deepEqual(wrapper.vm.history, [0, 1]);

    // mapped renamed actions
    wrapper.vm.localIncrement();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 2);
    assert.deepEqual(wrapper.vm.history, [0, 1, 2]);

    // mapped actions
    wrapper.vm.increment();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 3);
    assert.deepEqual(wrapper.vm.history, [0, 1, 2, 3]);

    // mapped mutations
    wrapper.vm.increment();
    await wrapper.vm.$nextTick();
    assert.equal(wrapper.vm.counter, 4);
    assert.deepEqual(wrapper.vm.history, [0, 1, 2, 3, 4]);
  });

});
