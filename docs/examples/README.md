# Examples

This section will detail code-heavy examples of how to use Auora in specific modern UI Frameworks. Generally, using Auora in a framework involves using an extension designed specifically for that framework. Frameworks currently with plugin support include (this list will grow as more plugins are created):

* [Vue](https://vuejs.org/)


And frameworks that will have future plugin support include (this list may change over time):

* [Angular](https://angular.io/)
* [React](https://reactjs.org/)
<!-- * [Svelte](https://svelte.dev/) -->


## Vue

Previous sections of the documentation have alluded to Vue components and how to register **Stores** in a Vue application, but let's go into more detail about the different types of levers available when using Auora in a **Vue** project.

### Basics

First, let's just go over the basics of how to bind a **Store** to a **Vue** application instance, using our simple [Counter](/guide/README.md#store) example from previous sections of the documentation. Here is what our folder structure might look like (typical for a small Vue project):

```
project/
├── package.json
└── src
    ├── views/
    │   └── ...
    ├── components/
    │   └── ...
    ├── index.js
    ├── router.js
    └── store.js
...
```

As you can see above, we've included a placeholder `store.js` file that will contain all code for the application store. As a refresher, let's re-define our **Store** from previous examples:

```javascript
// contents of src/store.js

import { Store } from 'auora';

const store = new Store({
  state: {
    count: 0,
  },
  actions: {
    increment(state) {
      state.count += 1;
    },
    incrementAsync(store) {
      return new Promise((resolve, reject) => {
        store.dispatch('increment');
        resolve();
      });
    }
  }
});
```

With our store defined, we can bind it to the main **Vue** application instance using the `store` keyword (after importing the `Auora` plugin and initializing it):

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

After binding the store, we can use it in components like:

```html
<template>
  <div>
    <p>{{ counter }}</p>
    <button @click="increment">Increment Counter</button>
    <button @click="incrementAsync">Increment Counter Asynchronously</button>
  </div>
</template>

<script>
export default {
  name: 'counter',
  store: {
    state: ['counter'],
    actions: ['increment', 'incrementAsync']
  },
}
</script>
```

Note that there is a new `store` keyword option that components can hook into for exposing parts of the store. The structure of that data will always be an **Object**, and requires the following format:

```javascript
store: {
  state: ['p1', 'p2'], // list of state params to expose as computed properties
  mutations: ['m1', 'm2'], // list of mutations to expose as methods
  actions: ['a1', 'a2'], // list of actions to expose as methods
}
```

For context, the **counter** definition above is equivalent to:

```javascript
export default {
  name: 'counter',
  computed: {
    counter: {
      get () {
        return this.$store.state.counter
      },
      set (value) {
        this.$store.commit('counter', value)
      }
    }
  },
  methods() {
    increment() {
      this.$store.dispatch('increment');
    },
    incrementAsync() {
      return this.$store.dispatch('incrementAsync');
    }
  }
}
```

::: tip

Note the use of **computed** properties to proxy access to state parameters. Since state variables are automatically bootstrapped with a **setter** mutation, these computed properties can be automatically generated. If you create other specific mutations that should be used for setting a state value, you can use a syntax similar to above for declaring that mutation in the `set` block of a computed property.

:::


As you can see above, all components will also have access to a `$store` variable with the full store object. For example, to dispatch an action explicitly inside a component, use:

```javascript
this.$store.dispatch('incrementAsync');
```

The syntax above is nice for explicitly showing what operations are available to specific components, but if we simply want to expose all available state metadata to a component, we can just set `store: true`:

```html
<template>
  <div>
    <p>{{ counter }}</p>
    <button @click="increment">Increment Counter</button>
    <button @click="incrementAsync">Increment Counter Asynchronously</button>
  </div>
</template>

<script>
export default {
  name: 'counter',
  store: true,
}
</script>
```

This will automatically reflect **all** store actions and methods into your component. However, it's recommended for clarity that specific store state parameters and operations are explicitly specified in components.

Another valid form of shorthand is:

```html
...

<script>
export default {
  name: 'counter',
  store: ['counter', 'increment', 'incrementAsync'],
}
</script>
```

This will automatically search for store actions, mutations, or parameters matching the specified names and will bind them to the component accordingly. The order of the search is **actions** → **mutations** → **state**.


### Modules

You can also utilize the concept of [Modules](/patterns/README.md#modules) when binding multiple stores to a **Vue** application instance. To illustrate this feature, let's consider the following application layout:

```
project/
├── package.json
└── src
    ├── index.js
    └── modules/
        ├── profile/
        │   ├── views/
        │   ├── components/
        │   ├── index.js
        │   ├── router.js
        │   └── store.js
        ├── feed/
        │   ├── views/
        │   ├── components/
        │   ├── index.js
        │   ├── router.js
        │   └── store.js
        ...
```

In this project, we've defined separate stores for both the `profile` and `feed` sections of the application.

To bind these separate stores to the same **Vue** application instance, you can use the following syntax:

```javascript
// contents of index.js
import Auora from 'auora/ext/vue';

import profile from '@/modules/profile/store';
import feed from '@/modules/feed/store';

Vue.use(Auora);

const app = new Vue({
  store: {
    profile,
    feed,
  }
});
```

Then, inside of components in your application, you can access those modules in a nested way like so:

```javascript
this.$store.profile.state.param1;
this.$store.profile.dispatch('profileAction');
this.$store.feed.state.param2
this.$store.feed.dispatch('feedAction');
```

Using the `store` property on components, we can expose specific functionality using the following syntax:

```html
<script>
  export default {
    name: 'my-component',
    store: {
      profile: {
        state: ['param1'],
        actions: ['profileAction'],
      },
      feed: {
        mutations: ['feedMutation'],
      }
    }
  }
</script>
```


### Name Collision

One of the oldest [gotchas](https://www.youtube.com/watch?v=oHg5SJYRHA0) in programming is unknowingly using the same name to represent different variables. To avoid name collision when using the `store` block in a Vue component, you can specify an object with name mapping for state variables (or any other construct). Here is an example:

```html
<template>
  <div>
    <h3>Extra Todos</h3>
    <p v-for="todo in todos">{{ todo.text }}</p>

    <h3>My Todos</h3>
    <p v-for="todo in myTodos">{{ todo.text }}</p>
  </div>
</template>

<script>
export default {
    name: 'todo-component',
    store: {
      state: {
        // local-name: state-param
        myTodos: 'todos'
      },
    }
    data() {
      return {
        todos: [
          { id: 1, text: 'extra todo 1' },
          { id: 2, text: 'extra todo 2' }
        ]
      }
    }
}
</script>
```

<!--

TODO: MAYBE DON'T ADD IN FIRST RELEASE -- THINK ABOUT INCLUDING IN FUTURE RELEASE AFTER USING THIS IN A PROJECT

### Dynamic Syncing

In the [Patterns](/patterns/README.md#syncing-actions) section of the documentation, we described a way of dynamically syncing standalone API functions with the store.


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

state = new State({ state, getters });
```

```javascript
export default {
    name: 'todo-component',
    store: {
      state: ['todos'],
      sync: {
        todos: [
          fetchTodos, completeTodo
        ]
      }
    }
    ...
}
```

...

-->


## Angular

You can still use Auora in an Angular project, but you'll currently need to figure out your own patterns for incorporating it. A native Angular plugin leveraging Auora will be included in a future release.

::: warning Help Wanted

If you're a Angular Pro and would like to help out by working on a Angular plugin, please file a `discussion` ticket in the GitHub [Issue Tracker](https://github.com/bprinty/auora/issues) for this project.

:::


## React

You can still use Auora in a React project, but you'll currently need to figure out your own patterns for incorporating it. A native React plugin leveraging Auora will be included in a future release.

::: warning Help Wanted

If you're a React Pro and would like to help out by working on a React plugin, please file a `discussion` ticket in the GitHub [Issue Tracker](https://github.com/bprinty/auora/issues) for this project.

:::

<!--
## Svelte

You can still use Auora in a Svelte project, but you'll currently need to figure out your own patterns for incorporating it. A native Svelte plugin leveraging Auora will be included in a future release.

::: warning Help Wanted

If you're a Svelte Pro and would like to help out by working on a Svelte plugin, please file a `discussion` ticket in the GitHub [Issue Tracker](https://github.com/bprinty/auora/issues) for this project.

::: -->
