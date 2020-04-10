# Overview
<script>
  // hide sub-headers for sidebar
  var el = document.getElementsByClassName('sidebar-sub-headers');
  if (el !== undefined && el.length > 0) {
    el[0].style.display = 'none';
  }
</script>

There are currently several broadly-adopted alternatives to state management for JavaScript applications (e.g. [Redux](https://github.com/reduxjs/redux), [MobX](https://github.com/mobxjs/mobx), [Vuex](https://github.com/vuejs/vuex), [Effector](https://github.com/zerobias/effector)). Each provide a unique developer experience and enforce a specific paradigm for changing state and broadcasting updates to linked views/components.

### Why Make *Another* State Manager?

This package is an alternative approach to the same problem, attempting to take the best ideas from each alternative listed above (and provide some new ones). It's meant to provide an all-in-one solution with an intuitive API that can easily fit into any frontend framework.

It also tries to consolidate and simplify constructs from other state managers. In this state manager, the concept of `reducers` and `mutations` has been removed in favor of an internally managed transactional layer.

The code for this project was initially developed as part of an all-purpose (frontend and backend) [ORM](https://bprinty.github.io/vuex-reflect), but after use and iteration has evolved into it's own thing.

### How is this Library Different?

Unique features provided by this library that aren't readily available in other state management libraries include:

::: tip No Mutations or Reducers

Mutations do not need to be defined when stores are created. Committing mutations to the store happens in a more fluid way through `actions` or explicit `store` commits. However, they're still available to users comfortable with that pattern.

:::

::: tip State Transactions

Actions dispatched from stores are automatically wrapped in a transaction so in-flight `state` changes don't affect store state if the action fails.

:::

::: tip Multi-Layered Hooks

Users can subscribe to both global events (i.e. `commit`, `dispatch`, etc ...), and *specific* changes to state variables.

:::

::: tip Simpler Syntax

Along with standard syntactic patterns, this module also supports a more fluid syntax for actions that allows users to call actions as functions instead of passing them as a string into `dispatch` calls.

:::

::: tip Framework-Agnostic

This library was built to work with any front-end framework (or without one), and also has thorough [Examples](/examples/) detailing how to best use this library within the context of several popular frameworks.

:::

Each of these core features is described in detail throughout the [Guide](/guide/) section of the documentation. For additional context on how to use this module in a front-end framework like [Vue](https://vuejs.org/) or [React](https://reactjs.org/), see the [Examples](/examples/) section of the documentation.


## Prerequisites

This documentation makes heavy use of ES6 JavaScript syntax. If the code throughout these docs looks like a foreign language, you can brush up on ES6 [here](https://babeljs.io/docs/en/learn).

Although this library is useful without a front-end framework, it's still helpful to understand the overall concepts. [Here](https://stackoverflow.blog/2020/02/03/is-it-time-for-a-front-end-framework/) is a good blog post that outlines value provided by front-end frameworks.


## Quickstart

To provide a quick and simple high-level picture of how this library can fit into a project, let's define a minimal **Store** and use that **Store** in a simple **Vue** application. We're going to define the `Hello World` of state management: a *counter* application.

### A Minimal Store

In our *counter* application, we're interested in managing the [state](/guide/README.md#state) of a `count` variable, and updating the state of that variable throughout our application in a way that will be reflected across components. Here is a dead-simple **Store** we can use for this example:

```javascript
import { Store } from 'auora';

const store = new Store({
  // state
  state: {
    count: 0,
    history: [0],
    operations: [],
  },

  // actions
  actions: {
    // sync
    increment({ state }) {
      state.count += 1;
      return state.count;
    },

    // async
    add({ state }, number) {
      return new Promise((resolve) => {
        state.count = state.count + number;
        resolve(state.count);
      });
    },
  },

  // events
  events: {
    dispatch(action, ...payload, { state }) {
      state.operations.push({ action, payload });
    }
  }

  // subscriptions
  subscribe: {
    count(newValue, oldValue, { state }) {
      state.history.push(state.count);
    },
  },

});
```

In this store, we've defined the following constructs:

* [`state`](/guide/README.md#state) - The global source of truth for data models in the application.
* [`actions`](/guide/README.md#actions) - Synchronous or asynchronous processes that can change state.
* [`events`](/guide/README.md#events) - Callbacks that execute after specific *events* that happen throughout the state management lifecycle.

More information about the purpose for each of these constructs can be found in the [Guide](/guide/) section of the documentation.

Outside of a framework, we can use the **Store** like so:

```javascript
store.state.count // 0
store.state.history // [0]
store.state.operations // []

store.apply.increment();
store.state.count // 1
store.state.history // [0, 1]
store.state.operations // [{action: 'increment', payload: []}]

store.reset('count');
store.state.count // 0
store.state.history // [0, 1, 0]
store.state.operations // [{action: 'increment', payload: []}]

store.apply.add(4).then(() => {
  store.state.count // 4
  store.state.history // [0, 1, 0, 4]
  store.state.operations // [{action: 'increment', payload: []}, {action: 'add', payload: [4]}]
});
```


### A Minimal Application

This library can be used within the context of any front-end framework, but let's use **Vue** to provide a concrete example of how it can easily augment front-end development. This package has several [Extensions](/examples/) built to easily bind **Stores** to modern front-end frameworks

First, to bind our store from the previous section in a **Vue** application, we can use:

```javascript
// contents of index.js
import Auora from 'auora/plugins/vue';

import counterStore from '@/store';

Vue.use(Auora);

const app = new Vue({
  el: '#app',
  store: counterStore
});
```

After binding the store, we can expose store **state**, **mutations**, and **actions** in components like:

```html
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">Increment Counter</button>
    <button @click="add(5)">Add 5 to Counter</button>
  </div>
</template>

<script>
export default {
  name: 'counter',
  store: {
    state: ['count'],
    actions: ['increment', 'add'],
  },
}
</script>
```

We can also access the store directly in components via:

```javascript
this.$store.count // 0

this.$store.apply.add(1).then(() => {
  this.$store.state.count // 1
});
```

That's it! For more information on state management or how to use different features of this plugin, see the [Guide](/guide/) section of the documentation.


## Table of Contents

- [Setup](/setup/)
- [Guide](/guide/)
- [Examples](/examples/)
- [API](/api/)


## Additional Resources

- [Vue](https://vuejs.org)
- [Vuex](https://vuex.vuejs.org)
