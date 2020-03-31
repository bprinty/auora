# Examples

Provide code-heavy examples of how to use your package.


## Vue

Provide examples of how to use the package in a Vue app.


### Basics

For example, here is how we can incorporate our [Counter](/guide/README.md#store) example into a **Vue** project. As a refresher, let's re-define our **Store** in a `store.js` file:

```javascript
// contents of src/store.js

import { Store } from 'auora';

const store = new Store({
  state: {
    count: 0,
  },
  mutations: {
    increment(state) {
      state.count += 1;
    }
  }
  actions: {
    incrementAsync(store) {
      return new Promise((resolve, reject) => {
        store.commit('increment');
        resolve();
      });
    }
  }
});
```

With our store defined, we can bind it to the main **Vue** application instance using the `store` keyword (after importing the `Auora` plugin and initializing it):

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
    mutations: ['increment'],
    actions: ['incrementAsync']
  },
}
</script>
```

All components will also have access to a `$store` variable with the full store object. For example, to dispatch an action explicitly inside a component:

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


### Modules

You can also utilize the concept of [Modules](/patterns/README.md#modules) when binding multiple stores to a **Vue** application instance. To bind multiple stores that maintain isolated functionality, you can use the following syntax:

```javascript
// contents of index.js
import Auora from 'auora/plugins/vue';


Vue.use(Auora);

const app = new Vue({
  store: {
    profile,
    feed,
  }
});
```


### Computed Properties

Talk about a two-way computed property.

```javascript
export default {  
  computed: {
    message: {
      get () {
        return this.$store.state.obj.message
      },
      set (value) {
        this.$store.commit('updateMessage', value)
      }
    }
  }
}
```

Change to:

```javascript
export default {
  store: {
    computed: ['message']
    // bind: ['message']
  }
}
```


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

### Name Collision

Talk about name collision and how to mitigate it:

any of the inputs to `store` section keys can be a list or a dictionary with name mapping.

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


## React

You can still use this library in a React project, but you'll currently need to figure out your own patterns for incorporating it. A native React plugin leveraging this library will be included in a future release.

::: warning Help Wanted

If you're a React Pro and would like to help out by working on a React plugin, please file a `discussion` ticket in the GitHub [Issue Tracker](https://github.com/bprinty/auora/issues) for this project.

:::


## Svelte

You can still use this library in a Svelte project, but you'll currently need to figure out your own patterns for incorporating it. A native Svelte plugin leveraging this library will be included in a future release.

::: warning Help Wanted

If you're a Svelte Pro and would like to help out by working on a Svelte plugin, please file a `discussion` ticket in the GitHub [Issue Tracker](https://github.com/bprinty/auora/issues) for this project.

:::
