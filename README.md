
[![Build Status](https://travis-ci.com/bprinty/auora.png?branch=master)](https://travis-ci.com/bprinty/auora) [![Code coverage](https://codecov.io/gh/bprinty/Flask-Occam/branch/master/graph/badge.svg)](https://codecov.io/gh/bprinty/Flask-Occam) [![Maintenance yes](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/bprinty/auora/graphs/commit-activity) [![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/bprinty/auora/blob/master/LICENSE) [![Documentation status](http://inch-ci.org/github/dwyl/hapi-auth-jwt2.svg?branch=master)](https://bprinty.github.io/auora)

# Auora


## Overview

There are currently several broadly-adopted alternatives to state management for JavaScript applications (e.g. [Redux](https://github.com/reduxjs/redux), [MobX](https://github.com/mobxjs/mobx), [Vuex](https://github.com/vuejs/vuex), [Effector](https://github.com/zerobias/effector)). Each provide a unique developer experience and enforce a specific paradigm for changing state and broadcasting updates to linked views/components.

### Why Make *Another* State Manager?

This package is an alternative approach to the same problem, attempting to take the best ideas from each alternative listed above (and provide some new ones). It's meant to provide an all-in-one solution with an intuitive API that can easily fit into any frontend framework.

It also tries to consolidate and simplify constructs from other state managers. In this state manager, the concept of `reducers` and `mutations` has been removed in favor of an internally managed transactional layer.

The code for this project was initially developed as part of an all-purpose (frontend and backend) [ORM](https://bprinty.github.io/vuex-reflect), but after use and iteration has evolved into it's own thing.

### How is this Library Different?

Unique features provided by this library that aren't readily available in other state management libraries include:

**No Mutations or Reducers**

Mutations do not need to be defined when stores are created. Committing mutations to the store happens in a more fluid way through `actions` or explicit `store` commits. However, they're still available to users comfortable with that pattern.

**State Transactions**

Actions dispatched from stores are automatically wrapped in a transaction so in-flight `state` changes don't affect store state if the action fails.

**tip Multi-Layered Hooks**

Users can subscribe to both global events (i.e. `commit`, `dispatch`, etc ...), and *specific* changes to state variables.

**Simpler Syntax**

Along with standard syntactic patterns, this module also supports a more fluid syntax for actions that allows users to call actions as functions instead of passing them as a string into `dispatch` calls.

**Framework-Agnostic**

This library was built to work with any front-end framework (or without one), and also has thorough [Examples](/examples/) detailing how to best use this library within the context of several popular frameworks.

Each of these core features is described in detail throughout the [Guide](/guide/) section of the documentation. For additional context on how to use this module in a front-end framework like [Vue](https://vuejs.org/) or [React](https://reactjs.org/), see the [Examples](/examples/) section of the documentation.


## Installation

### Install in Project

To use this library in a Vue project, add the package to your package dependencies via:

```bash
npm install --save auora
```

Or, with [yarn](https://yarnpkg.com/):

```bash
yarn add auora
```


### Use via CDN

To use this package via CDN, import it in your project via:

```html
<script src="https://unpkg.com/auora/dist/index.min.js"></script>
```


## Documentation

Documentation for the project can be found [here](http://bprinty.github.io/auora).


## Quickstart

To provide a quick and simple high-level picture of how this library can fit into a project, let's define a minimal **Store** and use that **Store** in a simple **Vue** application. We're going to define the `Hello World` of state management: a *counter* application.

### A Minimal Store

In our *counter* application, we're interested in managing the **state** of a `count` variable, and updating the state of that variable throughout our application in a way that will be reflected across components. Here is a dead-simple **Store** we can use for this example:

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

* `state` - The global source of truth for data models in the application.
* `actions` - Synchronous or asynchronous processes that can change state.
* `events` - Callbacks that execute after specific *events* that happen throughout the state management lifecycle.

More information about the purpose for each of these constructs can be found in the [Guide](https://bprinty.github.io/auora/guide/) section of the documentation.

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

This library can be used within the context of any front-end framework, but let's use **Vue** to provide a concrete example of how it can easily augment front-end development. This package has several [Extensions](https://bprinty.github.io/auora/examples/) built to easily bind **Stores** to modern front-end frameworks

First, to bind our store from the previous section in a **Vue** application, we can use:

```javascript
// contents of index.js
import Auora from 'auora/ext/vue';

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

That's it! For more information on state management or how to use different features of this plugin, see the [Guide](https://bprinty.github.io/auora/guide/) section of the documentation.


## Contributing

### Getting Started

To get started contributing to the project, simply clone the repo and setup the dependencies using `yarn` or `npm install`:

```bash
git clone git@github.com:bprinty/auora.git
cd auora/
yarn
```

Once you do that, you should be ready to write code, run tests, and edit the documentation.


### Building Documentation

To develop documentation for the project, make sure you have all of the developer dependencies installed from the `package.json` file in the repo. Once you have all of those dependencies, you can work on the documentation locally using:

```bash
yarn docs:dev
```

Or, using `vuepress` directly:

```bash
vuepress dev docs
```

### Running Tests

The [Jest](https://jestjs.io/) framework is used for testing this application. To run tests for the project, use:

```bash
yarn test
```

To have Jest automatically watch for changes to code for re-running tests in an interactive way, use:

```bash
yarn test:watch
```

To run or watch a specific test during development, use:

```bash
yarn test:watch -t model.update
```

Or, you can invoke `jest` directly:

```bash
jest
jest --watch
jest --watch -t model.update
```

### Submiting Feature Requests

If you would like to see or build a new feature for the project, submit an issue in the [GitHub Issue Tracker](https://github.com/bprinty/auora/issues) for the project. When submitting a feature request, please fully explain the context, purpose, and potential implementation for the feature, and label the ticket with the `discussion` label. Once the feature is approved, it will be re-labelled as `feature` and added to the project Roadmap.


### Improving Documentation

Project documentation can always be improved. If you see typos, inconsistencies, or confusing wording in the documentation, please create an issue in the [GitHub Issue Tracker](https://github.com/bprinty/auora/issues) with the label `documentation`. If you would like to fix the issue or improve the documentation, create a branch with the issue number (i.e. `GH-123`) and submit a PR against the `master` branch.


### Submitting PRs

For contributors to this project, please submit improvements according to the following guidelines:

1. Create a branch named after the ticket you're addressing. `GH-1` or `bp/GH-1` are examples of good branch naming.
2. Make your changes and write tests for your changes.
3. Run all tests locally before pushing code.
4. Address any test failures caught by [Travis CI](https://travis-ci.com/bprinty/auora).
5. Make sure you've updated the documentation to reflect your changes (if applicable).
6. Submit a PR against the `master` branch for the project. Provide any additional context in the PR description or comments.


### Keeping up to Speed on the Project

All development efforts for the project are tracked by the project [Kanban](https://github.com/bprinty/auora/projects/1) board. Contributors use that board to communicate the status of pending, in-progress, or resolved development efforts. If you have a question about the Roadmap or current in-progress issues for the project, see that board.
