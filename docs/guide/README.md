# Guide

Below, we'll cover some core concepts that should be understood about state management, and how this library can make state management simpler.


## Concepts

The core concepts that need to be understood when using this module (as with most state managers) are:

* [Store](#store) - The central manager for accessing state and **dispatching** actions.
* [State](#state) - The global source of truth for data models in the application.
* [Actions](#actions) - Synchronous or asynchronous processes that can change state.
* [Getters](#getters) - Functions for computing derived state (with caching between state changes).
* [Events](#events) - Callbacks that execute after specific *events* that happen throughout the state management lifecycle.


### The Central Dogma of State Management

If you've taken any biology classes, you've probably heard of the "Central Dogma of Molecular Biology". State management has a similar dogma that holds true across any application:

<img :src="$withBase('/central-dogma.png')" width="700px" alt="Central Dogma of State Management" />


Most reactive web applications also connect to an external service for sending/receiving data (e.g. REST API), which makes can make this process difficult to manage without an abstraction.


### Why Use a State Manager?

If you've built large applications with components and interactivity, you've likely used a state manager and understand the value. If you haven't, using a state manager is a way of simplifying the management of data and flow of events throughout your application. The diagram below shows an intuitive representation of the difference between an application without (left) and with (right) an application store:

<img :src="$withBase('/state-network.png')" width="700px" alt="State Network" />

Without a centralized state manager, components must be responsible for dispatching to other components to re-render a view, which can increase the difficulty in maintaining a codebase. Web application development can be complex, and state managers like this one are a way to abstract some of that complexity so code can be written in a more sustainable way.


## Store

The **Store** is a singular entry-point for accessing state data, dispatching actions that update state, and publishing events that happen throughout the store lifecycle. Expanding on the [central dogma](#the-central-dogma-of-state-management) diagram above, a store manages data changes (and cascading view changes) like:

<img :src="$withBase('/store-concept.png')" width="600px" alt="Store Concept" />

All of the **state**, **actions**, and **events** are managed by the store, so views and components can be developed in an isolated way.

To create a store with this library, you simply need to define the **state** and **actions** that the store should manage. For example, here is a store definition showing all types of configuration for a `counter` application (if you've used `Vuex` before, you'll be familiar with the syntax):

```javascript
const store = new Store({
  // state
  state: {
    count: 0
  },

  // actions
  actions: {
    increment(store) {
      return new Promise((resolve, reject) => {
        store.count += 1;
        resolve();
      });
    }
  },

  // events
  events: {
    update(param, { state }) {
      console.log(`[INFO] Incremented \`${param}\` to \`${state.counter}\``);
    },
    dispatch(action) {
      console.log(`[INFO] Finished executing action \`${action}\``);
    }
  }
});
```

The purpose of the store above is to:

1. Store a `count` variable that can update throughout the application.
2. Create async `actions` that can change state.
3. Bind callbacks to specific `events` that happen throughout data changes.

And once this is defined, you can use the store throughout your application like so:

```javascript
console.log(store.state.count); // 0

store.apply.increment();
// [INFO] Incremented `counter` to `1`
// [INFO] Finished executing action `increment`
```

Now that we've described a high-level example of how to configure a [Store](#store), let's go into detail on how each component of a store can be configured.

If you understand the core concepts and want to quickly jump into real-world examples, see the [Examples](/examples/) section of the documentation.


## State

As mentioned before, `state` is the global source of truth for your application. Examples of data state parameters can store include:

1. User profile metadata.
2. Collections of model data for a specific view.
3. User settings that affect how views display information.

When rendering, views read from `state` and upon user interaction, run functions that update state:

<img :src="$withBase('/state-concept.png')" width="500px" alt="State Concept" />


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

State should **not be changed directly**. All state parameters should be changed within [Actions](#actions).

:::

All state variables should be set within actions. Reasoning behind this and the flow of events that happen during state updates is detailed in the [Actions](#actions) section below.


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
  <p>{{ count }}</p>
</template>

<script>
export default {
  name: 'Counter',
  store: {
    state: ['count']
  }
}
</script>
```

For examples of how to use state in other front-end frameworks, see the [Examples](/examples/) section of the documentation.


## Actions

At the top of the chain for cascading state changes are `actions`. When a user interacts with a page, they trigger *actions* that update *state*. Actions represent more complex functionality that can change data across one or multiple state parameters in several stages. Examples of actions that trigger on user interaction include:

1. *PUT* requests to update user profile metadata.
2. *POST* requests to create a new model in a collection.
3. *GET* requests for fetching user settings information.

Although actions will commonly wrap communication with an external service (i.e. REST API), they don't have to. They can also be either **syncronous** or **asynchronous**.

Since actions can be complex and change state in many different ways, and accordingly provide guardrails around state changes throughout the lifecycle of an action. Here is a diagram detailing execution flow during an action:

<img id="action-flow" :src="$withBase('/action-flow.png')" width="600px" alt="Action Flow" />

The diagram above is pretty busy, but fully captures what happens as an action is executed. The imporant takeaway from this diagram is that actions **wrap state updates in transactions** so that errors that occur in the middle of action execution trigger a rollback to the previous state.


### Defining Actions

To define actions that can be used throughout your application, create a plain object with the actions and bind it to a **Store**. In this example, we'll connect a counter to an external API:

```javascript
import { Store } from auora;

const state = {
  count: 0,
}

const actions = {
  increment({ state }) {
    return axios.post('/counter/increment').then(response => {
      state.counter = response.data.result;
    });
  },
  add({ state }, value) {
    return axios.post('/counter/add', { value }).then(response => {
      state.counter = response.data.result;
    });
  }
}

const store = new Store({ state, actions });
```

There are also alternative ways of defining actions that can fit better into different types of application architectures. See the [Patterns](#patterns) section below for more information about how you can define and organize actions in a large project.


### Using Actions

Actions should be triggered throughout your application whenever a user interacts with a view. To directly execute an action, you can call it directly using the `apply` method on `Store` objects:

```javascript
store.apply.increment().then(response => {
  console.log('[INFO] Incremented counter and updated store!');
});

await store.apply.add(5);
```

You can also use the `dispatch` syntax for dispatching actions (as in other state managers). The above code is equivalent to:

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
    <p>{{ count }}</p>
    <button @click="increment">Increment Counter</button>
    <button @click="add(5)">Add 5 to Counter</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  store: {
    state: ['count'],
    actions: ['increment', 'add']
  },
}
</script>
```

For examples of how to dispatch actions in other front-end frameworks, see the [Examples](/examples/) section of the documentation.


### Transactions

Other state management libraries use the concept of `mutations` to manage explicitly committing changes to store. Although the concept of committing to `state` is necessary, it's not functionality users should worry about when building a state manager. Instead, this library uses the concept of *State Transactions* to manage.

During actions or other operations that change state, the store maintains a hot replica of the `state` in an internal `stage` object. When actions are dispatched, the `stage` object is passed into actions in lieu of `state`, and after actions are executed, is either used to commit new changes to the store or rollback the `stage` to match the current `state`.

Here is a sequence diagram that describes this process:

<img id="transaction-concept" :src="$withBase('/transaction-concept.png')" width="600px" alt="Transaction Concept" />

Because of this internal abstraction, instead of needing to define mutations for changing state:

```javascript
// not necessary (lots of boilerplate)
const store = new Store({
  state: { count: 0 },
  mutations: {
    SET_COUNT(state, value) {
      state.count = value;
    }
  }
  actions: {
    increment({ commit, state }) {
      commit('SET_COUNT', state.count + 1);
    }
  }
})
```

You can just change state directly in actions, without defining any specific state-changing mutations.

```javascript
// much less boilerplate
const store = new Store({
  state: { count: 0 },
  actions: {
    increment({ state }) {
      state.count += 1;
    }
  }
})
```

 And in doing so, you're protected against unwanted state changes propagating throughout your application. For example:

 ```javascript
 const store = new Store({
   state: { count: 0 },
   actions: {
     errorAction({ state }) {
       state.count = 1;
       throw new Error('Error!');
     }
   }
 })

 store.apply.errorAction();
 // Error!
 store.state.count // 0
 ```

If you need to commit intermediate changes to `state` inside of an action, you can still do so with the `state.commit()` method. For example, if we need to set the state for a `loading` variable while a request is issued, we can use:

```javascript
const store = new Store({
  state: {
    loading: false,
    count: 0,
  },
  actions: {
    errorRequest({ state }) {
      state.loading = true;
      state.commit(); // commit changes to state
      return axios.get('/missing-url').then(() => {
        state.count = 1;
      }).finally(() => {
        state.loading = false;
        state.commit();
      });
    }
  }
});

const promise = store.apply.errorRequest();
store.state.loading // true
await promise
store.state.loading // false
store.state.count // 0
```

### Composing Actions

For more complex use-cases, it can be useful for actions to dispatch to other actions during execution. For this, you can *compose* actions by using `apply` to dispatch other actions within an action. For example:

```javascript
const store = new Store({
  state: { ... },
  actions: {
    actionA({ apply }) {
      // code specific to actionA
      return apply.actionB();
    },
    actionB({ state }) {
      // code for actionB
    },
  }
});
```

Composing async actions is just as simple:

```javascript
const store = new Store({
  state: { ... },
  actions: {
    actionA({ apply }) {
      return apply.actionB().then((result) => {
        // process actionB results in a different way
      });
    },
    actionB({ state }) {
      return new Promise((resolve, reject) => {
        // code for actionB
      });
    },
  }
});
```

Finally, with async/await syntax:

```javascript
const store = new Store({
  state: { ... },
  actions: {
    async actionA({ apply }) {
      const result = await apply.actionB();
      // process actionB results in a different way
    },
    actionB({ state }) {
      return new Promise((resolve, reject) => {
        // code for actionB
      });
    },
  }
});
```

::: tip NOTE

When actions are composed, state transactions are not committed until the original parent action finishes. All nested actions will change the internal store `stage` object and a transaction with all the changes will happen at the end. This is designed to help protect against unwanted side effects with in-flight state changes within an action.

:::


## Getters

As mentioned before, `getters` are ways of computing derived state when state changes are made. For property-style getters, results are **cached** between state updates to make getter execution highly performant.


### Defining Getters

To define a getter for your store, create a plain object with *getter functions* and bind it to your **Store**:

```javascript
const store = new Store({
  state: { count: 1 },
  getters: {
    negCount(state) {
      return state.count * -1;
    },
  },
});

// using getter
store.get.netCount // -1
```

Getter functions accept `state` as their **only** argument and should return some type of derived state.

::: tip NOTE

Getters **must not change state in any way**. Getters are meant to summarize data, not change it.

:::

### Getters with Arguments

For applications that require more complex getters, you can return a function for computing derived state. For instance, if we wanted to define a getter to return the current count plus some extra value, we could use:

```javascript
const store = new Store({
  state: { count: 0 },
  getters: {
    countPlus: state => number => {
      return state.count + number;
    },
  },
});
```

Which would then allow us to utilize the getter in a functional way like so:

```javascript
store.get.countPlus(5) // 5
```

::: tip NOTE

Getter results will **not be cached** if getter functions return a nested function.

:::


### Using Getters

Expanding more upon how to use getters, let's say we have the following store (where we've defined two types of getters):

```javascript
const store = new Auora({
  state: {
    items: [
      { id: 1, foo: true },
      { id: 2, foo: false },
    ]
  },
  getters: {
    foos(state) {
      return state.items.filter(item => item.foo);
    },
    byId: state => id => {
      return state.items.find(item => item.id === id);
    }
  }
})
```

We can use each type of getter like so:

```javascript
// property-style getter
store.get.foos // [{id: 1, foo: true}]

// function-style getter
store.get.byId(2) // {id: 2, foo: false}
```

In an application, you can use getters just like any other variable. Here is an example of how to use getters in a [Vue](/examples/) component:

```html
<template>
  <p>{{ foos.length }}</p>
</template>

<script>
export default {
  name: 'Foo Number',
  store: {
    getters: ['foos'],
  }
}
</script>
```

For examples of how to use getters in other front-end frameworks, see the [Examples](/examples/) section of the documentation.


## Events

Now that we've covered the machinery to manage a data [Store](#store), let's talk about how to subscribe to events that take place throughout the lifecycle of store operations.

This package internally uses a [Publish-Subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) pattern that users can subscribe to for executing functions when specific types of events take place. If you've seen the diagrams [above](#action-flow), you're already somewhat familiar with events that are broadcasted (*published*) throughout store operations.

There are two types of events that are *published* throughout the execution of store processes:

1. [Global Events](#global-events) - Events that *publish* when **any** actions are dispatched or store parameters are changed.
2. [Specific Events](#specific-events) - Events that *publish* when **specific** actions are dispatched or store parameters are changed.

Each of these are described in more detail below, along with examples of how to subscribe to each type of event.


### Global Events

The following global events are *published* throughout the execution of store operations:

| Event | Description |
|-------|-------------|
| `idle` | Execute when the state manager goes back into an `idle` state (no action, mutation, or state change is taking place). |
| `reset` | Execute after any `reset` operation takes place (i.e. `store.reset()`) |
| `update` | Execute after any `state` parameter is changed directly. |
| `commit` | Execute after state changes are committed to the store. |
| `rollback` | Execute after any `rollback` operation takes place. |
| `dispatch` | Execute after any `action` is dispatched. |

To subscribe to these global events, use the `subscribe` method on `Store` objects:

```javascript
store.subscribe('action', (action, input, store) => {
  console.log(`[INFO] Action \`${action}\`dispatched with input \`${input}\`!`);
});

await store.apply.add(1);
// [INFO] Action `add` dispatched with input `1`!
```

Here's a more complete example showing subscriptions to the majority of event types:

```javascript
// idle
store.subscribe('idle', (store) => {
  console.log('[INFO] Store back to idle.');
});

// commit
store.subscribe('commit', (store) => {
  console.log(`[INFO] State has been updated!`);
})

// dispatch\
store.subscribe('dispatch', (action, input, store) => {
  console.log(`[INFO] Action \`${action}\` dispatched with input \`${input}\``);
});


// dispatch action to show event publishing
await store.apply.add(5);
/*
[INFO] State has been updated!.
[INFO] Action `add` dispatched with input `5`.
[INFO] Store back to idle.
*/
```

::: tip NOTE

Note that the code above is subscribing to the *termination* of **state**, **mutation**, and **action** execution.

:::


### Specific Events

Along with these global events, you can also subscribe to specific **state** changes, dispatched **actions**, or **mutation** commits. To subscribe to these events, call the `subscribe()` method available from the **Store** subsection you're interested in:

```javascript
store.subscribe('counter', (newValue, oldValue) => {
  console.log(`[INFO] Updated \`counter\` from \`${oldValue}\` to \`${newValue}\``);
});

store.subscribe('increment', (...payload) => {
  console.log(`[INFO] Dispatched action \`increment\``);
});
```

More specifically, here is how to subscribe to several data updates and operations for one of the Stores we defined [above](#actions):

```javascript
const store = new Store({
  state: { counter: 0 },
  actions: {    
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
});

// subscribe to state change
store.subscribe('counter', (input) => {
  console.log(`[INFO] \`counter\` param changed to value \`${input}\``);
});

// subscribe to action
store.subscribe('add', (input) => {
  console.log(`[INFO] \`add\` action dispatched with input \`${input}\``);
});

// execute other action with subscription
await store.apply.add(1);
/*
[INFO] `counter` param changed to value `2`
[INFO] `add` action dispatched with input `1`
*/
```


### Defining Events

As you might remember from other sections of the documentation, defining events when instantiating a **Store** is possible with the `events` and `subscribe` keywords. The `events` block is where you can subscribe to **global** events like `dispath`, `reset`, `commit`, etc... . The `subscribe` block is where you can subscribe to **specific** state changes or action calls. For example:

```javascript
import { Store } from 'auora';

const store = new Store({
  state: {
    count: 0,
  },
  actions: {
    increment({ state }) {
      state.counter += 1;
      return state.counter;
    },
  },
  events: {
    dispatch(action, ...payload, { state }) {
      state.operations.push({ action, payload });
    }
  }
  subscribe: {
    counter(newValue, oldValue, { state }) {
      state.history.push(state.counter);
    },
  },
});
```

Under the hood, `events` and `subscribe` definitions are consolidated into the same data structure, but it helps for code clarity and readability to have separate constructs for defining **global** and **specific** actions.


## Mutations

In short, `mutations` are functions that update `state`. They wrap specific types of updates to a `state` parameter and provide structure around state modifications and the associated downstream effects. Examples of mutations that change state include:

1. Updating user profile metadata after a request.
2. Adding a model to a collection of models.
3. Changing a user settings value.


::: warning NOTE

Defining and using mutations isn't necessary or recommended when using this library. This concept is included to create parity with existing state management architectures so code can easily be migrated over time.

:::


Mutations are used within API functions to update *state* and broadcast updates. Execution flow during a mutation looks something like this:

<img :src="$withBase('/mutation-flow.png')" width="500px" alt="Mutation Flow" />


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

These auto-generated mutations remove a lot of the boilerplate required for other libraries. For example, here is how you can quickly get up and running without configuring mutations for each state parameter:

```javascript
const store = new Store({ state: { counter: 0 } });

// set value of counter to 5
store.commit('counter', 5);

// increment counter
store.commit('counter', store.state.counter + 1);

// reset counter
store.reset('counter');
```


### Using Mutations

In an application, you should use mutations inside methods that execute when a user interacts with a view. To use a mutation, you use the `commit` method on `Store` objects:

```javascript
store.commit('increment');
store.commit('add', 5);
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
    mutations: ['increment'],
  },
  methods() {
    reset() {
      this.$store.reset('counter');
    }
  }
}
</script>
```

For examples of how to commit mutations in other front-end frameworks, see the [Examples](/examples/) section of the documentation.

---
---
<br />


::: danger THAT'S IT!

You've reached the end of the user guide. Thanks for reading until the end!

:::

If you have any questions that aren't answered by this documentation, feel free to file a `documentation` issue in the [GitHub Issue Tracker](https://github.com/bprinty/auora) for this project.
