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

::: tip Framework Agnostic

This library was built to work with any front-end framework (or without one), and also has thorough [Examples](/examples/) detailing how to best use this library within the context of several popular frameworks.

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


Most reactive web applications also connect to an external service for sending/receiving data (e.g. REST API), which makes can make this process difficult to manage without an abstraction.


### Why Use a State Manager?

If you've built large applications with components and interactivity, you've likely used a state manager and understand the value. If you haven't, using a state manager is a way of simplifying the management of data and flow of events throughout your application. The diagram below shows an intuitive representation of the difference between an application without (left) and with (right) an application store:

<img src="/state-network.png" width="700px" alt="State Network" />

Without a centralized state manager, components must be responsible for dispatching to other components to re-render a view, which can increase the difficulty in maintaining a codebase. Web application development can be complex, and state managers like this one are a way to abstract some of that complexity so code can be written in a more sustainable way.


## Store

The **Store** is a singular entry-point for accessing state data, committing mutations, and dispatching actions that commit mutations to update state. Expanding on the [central dogma](#the-central-dogma-of-state-management) diagram above, a store manages data changes (and cascading view changes) like:

<img src="/store-concept.png" width="600px" alt="Store Concept" />

All of the **action**, **mutation** and **event** operations are managed by the store, so views and components can be developed in an isolated way.

To create a store with this library, you simply need to define the **state**, **mutations**, and **actions** that the store should manage. For example, here is a store definition showing all types of configuration for a `counter` application (if you've used `Vuex` before, you'll be familiar with the syntax):

```javascript
const store = new Store({
  // state
  state: {
    count: 0
  },

  // mutations
  mutations: {
    increment(state) {
      state.count++
    }
  },

  // actions
  actions: {
    incrementAsync(store, number) {
      return new Promise((resolve, reject) => {
        store.commit('increment');
        resolve();
      });
    }
  },

  // events
  events: {
    update: (param, state) => {
      console.log(`[INFO] Incremented \`${param}\` to \`${state.counter}\``);
    },
    mutate: (mutation, state) => {
      console.log(`[INFO] Finished committing mutation \`${mutation}\``);
    },
    action: (action, state) => {
      console.log(`[INFO] Finished executing action \`${action}\``);
    }
  }
});
```

The purpose of the store above is to:

1. Store a `counter` variable that can update throughout the application.
2. Add `mutations` that can change that `counter` variable.
3. Create async `actions` that can **commit** those `mutations`.
4. Bind callbacks to specific `events` that happen throughout data changes.

And once this is defined, you can use the store throughout your application like so:

```javascript
console.log(store.state.counter); // 0

store.commit('increment');
// [INFO] Incremented `counter` to `1`
// [INFO] Finished committing mutation `increment`

await store.dispatch('incrementAsync');
// [INFO] Incremented `counter` to `2`
// [INFO] Finished committing mutation `increment`
// [INFO] Finished executing action `incrementAsync`
```

Now that we've described a high-level example of how to configure a [Store](#store), let's go into detail on how each component of a store can be configured.

If you understand the core concepts and want to quickly jump into real-world examples, see the [Examples](/examples/) section of the documentation.


## State

As mentioned before, `state` is the global source of truth for your application. Examples of data state parameters can store include:

1. User profile metadata.
2. Collections of model data for a specific view.
3. User settings that affect how views display information.

When rendering, views read from `state` and upon user interaction, run functions that update state:

<img src="/state-concept.png" width="500px" alt="State Concept" />


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

The most important thing to understand about state is that **it should not be chaned directly**.

::: tip NOTE

State should **not be changed directly**. All state parameters should be changed within [Mutations](#mutations).

:::

All state variables should be set by mutations. Reasoning behind this and the flow of events that happen during state updates is detailed in the [Mutations](#mutations) section below.


### Defining State

To define a state parameter for your application, create a plain object and bind it to a **Store**:

```javascript
import { Store } from auora;

const state = {
  myParam: null,
  myObject: {},
  myArray: []
}

const store = new Store({ state });
```

Defaults you define as a part of state will be the default values immediately available in your application. All values must be plain objects.

::: tip NOTE

State and state values **must be plain objects**. State is meant to warehouse data, not functionality.

:::

### Using State

In an application, you can use state as any other variable. Here is an example of how to use state in a [Vue](/examples/) component:

```html
<template>
  <p>{{ counter }}</p>
</template>

<script>
export default {
  name: 'counter',
  store: {
    state: ['counter']
  }
}
</script>
```

For examples of how to use state in other front-end frameworks, see the [Examples](/examples/) section of the documentation.


## Mutations

In short, `mutations` are functions that update `state`. They wrap specific types of updates to a `state` parameter and provide structure around state modifications and the associated downstream effects. Examples of mutations that change state include:

1. Updating user profile metadata after a request.
2. Adding a model to a collection of models.
3. Changing a user settings value.


Mutations are used within API functions to update *state* and broadcast updates. Execution flow during a mutation looks something like this:

<img src="/mutation-flow.png" width="500px" alt="Mutation Flow" />


As you can see in the diagram above, mutations broadcast events throughout execution that parts of an application can hook into. Although not directly shown in the diagram, it is important to understand that **mutations** should be **syncronous** operations.


::: tip NOTE

All mutations should be **syncronous** operations. Asynchronous operations that update a store should be concfigured as [Actions](#actions).

:::

For more information on how to use **asynchronous** operations that commit mutations, see the [Actions](#actions) section below.


### Defining Mutations

To define a mutations for your application, create a plain object with the mutations and bind it to a **Store**:

```javascript
import { Store } from auora;

const state = {
  counter: 0,
}

const mutations = {
  increment(state) {
    state.counter += 1;
  },
  add(state, value) {
    state.counter += value;
  }
}

const store = new Store({ state, mutations });
```

Inputs to mutation functions include a copy of the `state` and any arguments passed to the mutation when ``commit`` is called.


### Pre-defined Mutations

When state variables are declared with this library, the following mutations are automatically created:

| Name | Purpose |
|------|---------|
| `<param>` | Set the value of the state param. |
| `<param>.reset` | Reset the state parameter back to its original value. |
| `<param>.sync` | Update a new record or object key for a state param. See below. |
| `<param>.add` | Add a new record or object key to a state param. See below. |
| `<param>.remove` | Remove a new record or object key to a state param. See below. |


These auto-generated mutations remove a lot of the boilerplate required for other libraries. For example, here is how you can quickly get up and running with these auto-defined mutations:

```javascript
const store = new Store({ state: { counter: 0 } });

// set value of counter to 5
store.commit('counter', 5);

// increment counter
store.commit('counter', store.state.counter + 1);

// reset counter
store.commit('counter.reset');
```

More complex mutations like *sync*, *add*, and *remove* are useful for updates to `Array` or `Object` state variables:

```javascript
const store = new Store({
  state: {
    myObj: {},
    myArr: []
  }
});

// add
store.commit('myObj.add', 'name', 'foo');
store.commit('myArr.add', { id: 1, name: 'bar' });
/* contents of `store.state`
{
  myObj: {
    name: 'foo'
  },
  myArr: [
    { id: 1, name: 'bar' },
  ]
}
*/

// sync
store.commit('myObj.sync', 'name', 'baz');
store.commit('myArr.sync', { id: 1, name: 'baz' });
/* contents of `store.state`
{
  myObj: {
    name: 'baz'
  },
  myArr: [
    { id: 1, name: 'baz' },
  ]
}
*/

// remove
store.commit('myObj.remove', 'name');
store.commit('myArr.remove', 1);
/* contents of `store.state`
{
  myObj: {},
  myArr: []
}
*/
```

Note from above that `sync` operations will automatically find and update records with a matching `id` (if the input is an object). If no `id` is in the object to sync, a new record will be added to the array. Similarly, `remove` operations will automatically find and remove records with a matching `id` if (records are objects). Otherwise, it will remove any entry equal to the supplied value. These two helpers are designed to help with managing data from an external API.


### Using Mutations

In an application, you should use mutations inside methods that execute when a user interacts with a view. To use a mutation, you use the `commit` method on `Store` objects:

```javascript
store.commit('increment')
store.commit('add', 5)
```

Here is an example of how to use mutations in a [Vue](/examples/) component:

```html
<template>
  <div>
    <p>{{ counter }}</p>
    <button @click="increment">Increment Counter</button>
    <button @click="reset">Reset Counter</button>
  </div>
</template>

<script>
export default {
  name: 'counter',
  store: {
    state: ['counter'],

  },
  methods() {
    increment: () => this.$store.commit('increment');
    reset: () => this.$store.commit('counter.reset');
  }
}
</script>
```

For examples of how to commit mutations in other front-end frameworks, see the [Examples](/examples/) section of the documentation.


## Actions

At the top of the chain for cascading state changes are `actions`. When a user interacts with a page, they trigger *actions* that use *mutations* to update *state*. Actions represent more complex functionality that can change data across one or multiple state parameters in several stages. Examples of actions that trigger on user interaction include:

1. *PUT* requests to update user profile metadata.
2. *POST* requests to create a new model in a collection.
3. *GET* requests for fetching user settings information.

Although actions will commonly wrap communication with an external service (i.e. REST API), they don't have to. They can also be either **syncronous** or **asynchronous**.

Actions are generally more complex than mutations, and accordingly provide guardrails around state changes throughout the lifecycle of an action. Here is a diagram detailing execution flow during an action:

<img src="/action-flow.png" width="500px" alt="Action Flow" />


As you can see, the diagram above is a lot busier than the diagram we saw in the [Mutations](#mutations) section of the documentation. In addition to wrapping mutations, actions also **wrap state updates in transactions** so that errors that occur in the middle of action execution trigger a rollback to the previous state.

::: tip

If you don't care about transactional support in store actions, you can turn it off. See the [Configuration](/setup/README.md#configuration) section for more information.

:::


### Defining Actions

To define actions that can be used throughout your application, create a plain object with the actions and bind it to a **Store**. In this example, we'll connect a counter to an external API:

```javascript
import { Store } from auora;

const state = {
  counter: 0,
}

const actions = {
  increment(store) {
    return axios.post('/counter/increment').then(response => {
      store.commit('counter', response.data.result);
    });
  },
  add(store, value) {
    return axios.post('/counter/add', { value }).then(response => {
      store.commit('counter', response.data.result);
    });
  }
}

const store = new Store({ state, mutations });
```

There are also alternative ways of defining actions that can fit better into different types of application architectures. See the [Patterns](#patterns) section below for more information about how you can define and organize actions in a large project.


### Using Actions

Actions should be triggered throughout your application whenever a user interacts with a view. To directly execute an action, you can use the `dispatch` method on `Store` objects:

```javascript
store.dispatch('increment').then(response => {
  console.log('[INFO] Incremented counter and updated store!');
});

await store.dispatch('add', 5);
```

In an application, you should bind actions to user interaction on a view. Here is an example of how to use actions in a [Vue](/examples/) component:

```html
<template>
  <div>
    <p>{{ counter }}</p>
    <button @click="increment">Increment Counter</button>
    <button @click="add(5)">Add 5 to Counter</button>
  </div>
</template>

<script>
export default {
  name: 'counter',
  store: {
    state: ['counter'],
    actions: ['increment', 'add']
  },
}
</script>
```

For examples of how to dispatch actions in other front-end frameworks, see the [Examples](/examples/) section of the documentation.


## Events

Talk about subscribing to events.

Events have been alluded to in previous sections ...

This package utilizies a

There are two types of events that can be subscribed to:

1. [Global Events](#global-events) - Events that *publish* when **any** actions are dispatched, mutations are committed, and store parameters are changed.
2. [Specific Events](#specific-events) - Events that *publish* when **specific** actions are dispatched, mutations are committed, and store parameters are changed.


<!-- At the top of the chain for cascading state changes are `actions`. When a user interacts with a page, they trigger *actions* that use *mutations* to update *state*. Actions represent more complex functionality that can change data across one or multiple state parameters in several stages. Examples of actions that trigger on user interaction include: -->


### Global Events

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
store.actons.subscribe('add', () => {
  console.log('[INFO] `add` action dispatched!');
});

await store.dispatch('add', 1);
// [INFO] `counter` changed!
// [INFO] `add` mutation called!
// [INFO] `add` action dispatched!
```

### Specific Events

You can also subscribe to



::: tip

If you frequently work with data models throughout your applicaiton, see the [Auora](https://bprinty.github.io/auora) library for adding an ORM layer to your application. It integrates directly with this library and abstracts a lot of the boilerplate necessary for pulling data from an external API.

:::


If you have any questions that aren't answered by this documentation, feel free to file a `documentation` issue in the [GitHub Issue Tracker](https://github.com/bprinty/jest-axios) for this project.
