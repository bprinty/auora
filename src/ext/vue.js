/**
 * Vue plugin for Auora
 */


// imports
// -------
import { isArray, isFunction } from '../utils';


// helpers
// -------
/**
 * Normalize input data into dictionary, no matter
 * what input type. If function, call the function and
 * re-process. If array, make an object with keys and values
 * equal to array items.
 *
 * @param {object} data - Data to normalize.
 */
export function normalizeObject(data) {
  if (isFunction(data)) {
    return normalizeObject(data());
  } else if (isArray(data)) {
    const result = {};
    data.forEach((item) => {
      result[item] = item;
    });
    return result;
  } else {
    return data;
  }
}


function createComputed(spec, store) {
  const computed = {};
  if (spec === true || spec === '*') {
    spec = Object.keys(store.state);
  }
  const mapping = normalizeObject(spec);
  Object.keys(mapping).forEach((key) => {
    computed[key] = {
      cache: false,
      get: () => store.state[mapping[key]],
      set: (value) => store.commit(mapping[key], value),
    };
  });
  return computed;
}

function createMutations(spec, store) {
  const methods = {};
  if (spec === true || spec === '*') {
    const state = Object.keys(store.state);
    spec = Object.keys(store.mutations).filter(key => !state.includes(key));
  }
  const mapping = normalizeObject(spec);
  Object.keys(mapping).forEach((key) => {
    methods[key] = (...payload) => store.commit(mapping[key], ...payload);
  });
  return methods;
}

function createActions(spec, store) {
  const methods = {};
  if (spec === true || spec === '*') {
    spec = Object.keys(store.actions);
  }
  const mapping = normalizeObject(spec);
  Object.keys(mapping).forEach((key) => {
    methods[key] = store.apply[mapping[key]];
  });
  return methods;
}


// mixin
// -----
const Mixin = {
  beforeCreate() {
    const self = this;
    const options = self.$options;
    let computed = {};
    let methods = {};

    // inject store
    if (options.store) {
      self.$store = isFunction(options.store) ? options.store() : options.store;
    } else if (options.parent && options.parent.$store) {
      self.$store = options.parent.$store
    }

    // add declared state to computed properties
    if ('state' in options) {
      // global
      if ('state' in self.$store) {
        computed = Object.assign(computed, createComputed(options.state, self.$store));

      // modular
      } else {
        Object.keys(self.$store).forEach((key) => {
          if (key in options.state) {
            computed = Object.assign(computed, createComputed(options.state[key], self.$store[key]));
          }
        });
      }
    }

    // add declared mutations to methods
    if ('mutations' in options) {
      // global
      if ('mutations' in self.$store) {
        methods = Object.assign(methods, createMutations(options.mutations, self.$store));

      // modular
      } else {
        Object.keys(self.$store).forEach((key) => {
          if (key in options.mutations) {
            methods = Object.assign(methods, createMutations(options.mutations[key], self.$store[key]));
          }
        });
      }
    }

    // add declared actions to methods
    if ('actions' in options) {
      // global
      if ('actions' in self.$store) {
        methods = Object.assign(methods, createActions(options.actions, self.$store));

      // modular
      } else {
        Object.keys(self.$store).forEach((key) => {
          if (key in options.actions) {
            methods = Object.assign(methods, createActions(options.actions[key], self.$store[key]));
          }
        });
      }
    }

    // assign additions
    options.computed = Object.assign(options.computed || {}, computed);
    options.methods = Object.assign(options.methods || {}, methods);
  },
};


// plugin
// ------
export default function (Vue) {
  const version = Number(Vue.version.split('.')[0]);

  // use beforeCreate hook for Vue > 2
  if (version >= 2) {
    Vue.mixin(Mixin);

  // backwards compatibility
  } else {
    const _init = Vue.prototype._init
    Vue.prototype._init = (options = {}) => {
      options.init = options.init ? [Mixin.beforeCreate].concat(options.init) : Mixin.beforeCreate;
      _init.call(this, options);
    }
  }
};
