# Guide

There are currently several broadly-adopted alternatives to state management for JavaScript applications (e.g. [Redux](https://github.com/reduxjs/redux), [MobX](https://github.com/mobxjs/mobx), [Vuex](https://github.com/vuejs/vuex), [Effector](https://github.com/zerobias/effector)). Each provide a unique developer experience and enforce a specific paradigm for changing state and broadcasting updates to linked views/components.

### Why Make *Another* State Manager?

This package is an alternative approach to the same problem, attempting to take the best ideas from each alternative listed above (and provide some new ones). It's meant to provide an all-in-one solution with an intuitive API that can easily fit into any frontend framework.

The code for this project was initially developed as part of an all-purpose (frontend and backend) [ORM](https://bprinty.github.io/vuex-reflect), but after use and iteration has evolved into it's own thing.

### How is this Library Different?

Unique features provided by this library that aren't readily available in other state management libraries include:

::: tip State Transactions

Stores can be configured with optional transaction support in `actions` that will rollback `state` on errors during action execution.

:::

::: tip Multi-Layered Hooks

Users can subscribe to both global events (i.e. `before-mutate`, `after-action`, etc ...), and *specific* actions, mutations, or changes to state variables.

:::

::: tip Declarative Syntax

Along with standard syntactic patterns, this module also supports a more declarative syntax that enables developers to write clearer and more maintainable code.

:::

Each of these core features is described in detail throughout the sections below. For additional context on how to use this module in a front-end framework like [Vue](https://vuejs.org/) or [React](https://reactjs.org/), see the [Examples](/examples/) section of the documentation.

## Concepts

The core concepts that need to be understood when using this module (as with most state managers) are:

* [Store](#store) - The central manager for accessing state, **committing** mutations, and **dispatching** actions.
* [State](#state) - The global source of truth for data models in the application.
* [Mutations](#mutations) - Operations that change state.
* [Actions](#actions) - Synchronous or asynchronous processes that can execute (**commit**) mutations.
* [Events](#events) - Operations that views and components can subscribe to for cascading updates.

### The Central Dogma of State Management

If you've taken any biology classes, you've probably heard of the "Central Dogma of Molecular Biology". State management has a similar dogma that holds true across any application:

<img src="/central-dogma.png" width="700px" alt="Central Dogma of State Management" />


### Why Use a State Manager?

If you've built large applications with components and interactivity, you've likely used a state manager and understand the value. If you haven't, using a state manager is a way of simplifying the management of data and flow of events throughout your application. The diagram below shows an intuitive representation of the difference between an application without (left) and with (right) an application store:

<img src="/state-network.png" width="700px" alt="State Network" />

Without a centralized state manager, components must be responsible for dispatching to other components to re-render a view, which can increase the difficulty in maintaining a codebase. Web application development can be complex, and state managers like this one are a way to abstract some of that complexity so code can be written in a more sustainable way.


## Store

The **Store** is a singular entry-point for accessing state data, committing mutations, and dispatching actions that commit mutations to update state. Expanding on the [central dogma](#the-central-dogma-of-state-management) diagram above, a store manages data changes (and cascading view changes) like:

<img src="/store-concept.png" width="600px" alt="Store Concept" />

All of the **action**, **mutation** and **event** operations are managed by the store, so views and components can be developed in an isolated way.

To create a store with this library, you simply need to define the **state**, **mutations**, and **actions** that the store should manage. For example, here is the store definition for a dead-simple `counter` application (if you've used `Vuex` before, you'll be familiar with the syntax):

```javascript
const store = new Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    incrementAsync(store, number) {
      return new Promise((resolve, reject) => {
        store.commit('increment');
        resolve();
      });
    }
  }
});
```

And once this is defined, you can use the store throughout your application like so:

```javascript
console.log(store.state.counter); // 0

store.commit('increment');
console.log(store.state.counter); // 1

store.dispatch('incrementAsync').then(() => {
  console.log(store.state.counter); // 2
});
```

If you understand the core concepts and want to jump into real-world examples, see the [Examples](/examples/) section of the documentation.


## State

Talk about the concept of state.

State for a store can be as simple as:

```javascript
const state = {
  counter: 0
};
```

Or as complex as:

```javascript
const state = {
  profile: {
    username: 'me',
  }
  posts: [
    { id: 1, title: 'Foo', body: '<div>foo</div>', author_id: 1 },
    { id: 2, title: 'Bar', body: '<div>bar</div>', author_id: 1 },
  ],
  authors: [
    { id: 1, name: 'Jane Doe' },
  ]
  ...
};
```


All state variables should be set by mutations (not directly). The flow of events that happen during state updates is detailed in the [Mutations](#mutations) section below.

## Mutations

Talk about the concept of mutations. ...

Execution flow during a mutation looks something like this:

<img src="/mutation-flow.png" width="500px" alt="Mutation Flow" />


## Actions

Talk about the concept of actions.

Actions can be more complex than mutations, and accordingly provide guardrails around state changes throughout the lifecycle of an action. Here is a diagram detailing execution flow during an action:

<img src="/action-flow.png" width="500px" alt="Action Flow" />


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


## Test

... talk about creating a shared set of API methods used throughout components in an applciation.

**Method 1**:  

Define API methods in a common

```javascript
// api.js
import store from '@/store';

function getDoneTodos() {
  return store.state.todos.filter(x => x.done);
}


function fetchTodos() {
  return axios.get('/todos').then(response => {
    const todos = response.data;
    store.commit('todos.sync', todos);
    return todos;
  });
}

function completeTodo(id) {
   return axios.post(`/todos/${id}`).then(response => {
     const todo = response.data;
     store.commit('todos.sync', todo);
     return todo;
   });
}
```

```javascript
const todos = await fetchTodos();
await completeTodo(todos[0].id);
const done = getDoneTodos();
```


**Method 2**

Define API methods as actions in the store:

```javascript
const state = {
  todos: [],
};

const getters = {
  getDoneTodos: state => state.todos.filter(x => x.done)
}

const actions = {
  fetchTodos(store) {
    return axios.get('/todos').then(response => {
      const todos = response.data;
      store.commit('todos.sync', todos);
      return todos;
    });
  },
  completeTodo(store, id) {
    return axios.post(`/todos/${id}`).then(response => {
      const todo = response.data;
      store.commit('todos.sync', todo);
      return todo;
    });
  }
}

const store = new Store({ state, getters, actions });
```

```javascript
const todos = await store.dispatch('fetchTodos');
await store.dispatch('completeTodo', todos[0].id);
const done = store.get('doneTodos');
```

**Method 3**

```javascript
// api.js
function fetchTodos() {
  return axios.get('/todos').then(response => response.data);
}

function completeTodo(id) {
   return axios.post(`/todos/${id}`).then(response => response.data);
}

const state = {
  todos: [],
};

const getters = {
  getDoneTodos: state => state.todos.filter(x => x.done)
}

const actions = {
  fetchTodos: store.sync('todos', fetchTodos),
  completeTodo: store.sync('todos', completeTodo),
}

state = new State({ state, getters, actions });
```

```javascript
const todos = await store.dispatch('fetchTodos');
await store.dispatch('completeTodo', todos[0].id);
const done = store.get('doneTodos');
```


::: tip

If you frequently work with data models throughout your applicaiton, see the [Auora](https://bprinty.github.io/auora) library for adding an ORM layer to your application. It integrates directly with this library and abstracts a lot of the boilerplate necessary for pulling data from an external API.

:::


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
