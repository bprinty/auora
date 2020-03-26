# Guide

This section details how to use the module, including ....

There are several alternatives you can use when trying to manage state for an application, each with their own nuances and caveats:

* [Redux](https://github.com/reduxjs/redux)
* [MobX](https://github.com/mobxjs/mobx)
* [Vuex](https://github.com/vuejs/vuex)
* [Effector](https://github.com/zerobias/effector)

This package is an alternative take at state management, that attempts to take the best ideas from each of these frameworks to provide an all-in-one solution with an intuitive API that can easily fit into any frontend framework. The features provided by this library that aren't avaialble in other libraries include:

1. Optional transaction support in `actions` that can roll back `state` on errors.
2. ...


## Concepts

The core concepts that need to be understood when using this module are:

* [State](#state) - The global source of truth for data models in the application.
* [Mutations](#mutations) - Operations that change state.
* [Actions](#actions) - Syncronous or asyncronous processes that can **commit** mutations.
* [Events](#events) - Operations that views and components can subscribe to for cascading updates.

For additional context on how to use this module in a front-end framework like [Vue](https://vuejs.org/) or [React](https://reactjs.org/), see the [Examples](/examples/) section of the documentation.


## State

Talk about the concept of state.

All state variables should be set by mutations (not directly). The flow of events that happen during state updates is detailed in the [Mutations](#mutations) section below.

## Mutations

Talk about the concept of mutations.

Execution flow during a mutation looks something like this:

<mermaid>
graph TB
  start([start]) --> commit["commit('increment')"]
  commit --> execute
  subgraph mutation
  execute --> state
  end
  state --> idle([idle])
  state --> publish[/publish/]
</mermaid>


## Actions

Talk about the concept of actions.

Actions can be more complex than mutations, and accordingly provide guardrails around state changes throughout the lifecycle of an action. Here is a diagram detailing execution flow during an action:

...


## Events

Talk about subscribing to events.

Events have been alluded to in previous sections ...

The following global events are available

| Event | When |
|-------|------|
| `idle` | Execute when the state manager goes back into an `idle` state (no action, mutation, or state change is taking place). |
| `update` | Execute after any `state` change takes place. |
| `mutate` | Execute after any `mutation` is committed. |
| `action` | Execute after any `action` is dispatched. |

<!-- | `before-update` | Execute before any `state` change takes place. | -->
<!-- | `before-mutate` | Execute before any `mutation` is committed. | -->
<!-- | `before-action` | Execute before any `action` is dispatched. | -->

To subscribe to these global events, use:

```javascript
store.subscribe('action', () => {
  console.log('[INFO] Action dispatched!');
});

await store.dispatch('addAsync', 1);
// [INFO] Action dispatched!
```

Along with these global events, you can subscribe to specific `state` changes, dispatched `actions`, or `mutation` commits. To subscribe to a specific mutation, use:

```javascript
// subscribe to state change
store.state.subscribe('counter', () => {
  console.log('[INFO] `counter` changed!');
});

// subscribe to mutation
store.mutations.subscribe('add', () => {
  console.log('[INFO] `add` mutation called!');
})

// subscribe to action
store.state.subscribe('addAsync', () => {
  console.log('[INFO] `addAsync` action dispatched!');
});

await store.dispatch('addAsync', 1);
// [INFO] `counter` changed!
// [INFO] `add` mutation called!
// [INFO] `addAsync` action dispatched!
```


## Syntax

There are two supported paradigms for declaring store variables and their associated mutations/actions:

1. Declarative - ...
2. Explicit - ...



You can also use this declarative mechanism for other Vuex state properties as well (even if you're not connecting to an external API):

```javascript
/**
* Simple counter state property for counting something.
*/
const counter = {
  default: 0,
  mutations: {
    increment: value => value + 1,
  },
  actions: {
    add(value) => {
      counter.state = counter.state + value;
    }
  }
}

// instantiate store with module
store = new Store({
  modules: {
    counter,
  },
})
```

::: warning

Talk about assumptions made by mutations with this syntax -> they're always used to update the specified property directly, so no ``state`` proxy needs to be passed in.

:::

Using this way of defining state properties, mutations for updating the data are automatically created for the store, along with any additional mutations provided for the property:

```javascript
// using it in the store
store.state.counter; // get the state for counter
store.commit('counter', 2); // set the counter value to `2`
store.commit('increment'); // increment the counter
```

This may seem like a trivial syntactic pivot for non-API operations, but it becomes more useful when you're dealing with many state properties with lots of complexity. It also helps for maintainability to see all mutations/actions associated with a specific state property in the same block of code. Take the following code for example:

```javascript
const counter = {
  default: 0,
  type: Number,
  mutations: {
    increment: {
      before: () => {},
      apply: value => value + 1,
      callback: () => {},
    },
  },
  actions: {
    add: {
      before: () => {},
      dispatch: (current, value) => {
        return current + value;
      },
      callback: () => {},
    }
  }
```

```javascript
const state = {
  counter: 0,
}
const mutations = {
  increment(state, value) {
    state.counter = value;
  }
}
const actions = {
  add({ state, commit }, value) => {
    commit('counter', state.value + value);
  }
}
```



```javascript
/**
 * Simple counter state property for counting something.
 */
const counter = {
  default: 0,
  type: Number,
  mutations: {
    increment: value => value + 1,
    incrementBy: (value, extra) => value + extra,
    decrement: value => value - 1,
  },
  actions: {
    incrementAsync({ commit }) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('increment');
        }, 1000);
      });
    }),
    incrementAndAdd({ commit }, value) {
      commit('increment');
      commit('incrementBy', value);
    },
  }
}

/**
 * Other dummy property for example.
 */
const otherProperty = {
  default: 'foo',
  type: String,
  mutations: {
    addBar: value => `${value}bar`,
  },
  actions: {
    postBar({ commit }) {
      return axios.post('/api/bar');
    }
  }
}

// instantiate store with module
store = new Store({
  modules: {
    counter,
    otherProperty,
  },
})
```

This might be preferable (easier to understand/maintain) compared to how Vuex constructs are normally declared:

```javascript
const store = {
  counter: 0,
  otherProperty: 'foo',
};

const mutations = {
  counter(state, value) {
    state.counter = Number(value);
  },
  increment(state) {
    state.count++;
  },
  incrementBy(state, extra) {
    state.count + extra;
  },
  decrement(state){
    state.count--;
  },
  otherProperty(state, value) {
    state.otherProperty = String(value);
  },
  addBar(state) {
    state.value = `${value}bar`;
  },
};

const actions = {
  incrementAsync({ commit }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    });
  }),
  incrementAndAdd({ commit }, value) {
    commit('increment');
    commit('incrementBy', value);
  },
  postBar({ commit }) {
    return axios.post('/api/bar');
  }
};
```

Obviously, syntactic preference is a subjective thing and changes based on differences in background and individual coding style. The main reason for introducing this more declarative syntax is because it is used for defining models for API endpoints.



If you have any questions that aren't answered by this documentation, feel free to file a `documentation` issue in the [GitHub Issue Tracker](https://github.com/bprinty/jest-axios) for this project.
