# Patterns

As with any middleware library, there are architectural decisions developers need to make so that they don't accrue technical debt over the lifecycle of the software they're developing. This section provides some detail and guidance around the nuances of different architectural patterns users might choose for their project. Here is an overview of what will be covered:

1. [Declarative Syntax](#declarative-syntax) - An alternative to the explicit syntax outlined in previous [sections](/guide/), which may help produce more readable and maintainable code (depending on developer preferences).
2. [Application Structure](#application-structure) - Tips for how to structure large applications with complex stores.
3. [Shared Actions](#shared-actions) - Guidelines for importing existing API utilities into a store as actions.
4. [Modules](#modules) - How to use multiple stores in an application for different logical blocks of functionality.



::: warning organize below
:::

## Declarative Syntax


## Application Structure


## Shared Actions


## Modules

Modern web applications can be incredibly complex with multiple isolated blocks of functionality. For example, in the **Todo List** application referenced throughout this documentation, we might want to have separate stores for 1) managing a user's profile information, and 2) managing a user's todo list. Data management across each of those stores operates independently, so we don't technically need to make them connected in any way by putting them in the same store. Here is what defining multiple stores for that use case might look like:

```javascript
const profile = new Store({
  state: {
    name: '<anonymous>',
  },
  actions: {
    login: (store, { email, password }) => {
      return axios.post('/login').then(response => {
        store.commit('name', response.data.name);
      });
    },
  },
})

const todos = new Store({
  state: {
    todos: []
  }
  actions: {
    fetch:
    add:
    complete:
  }
})


await profile.dispatch('login', { email: '', password: '' });

await todos.dispatch('fetch');

```




In a Vue project, declaring and binding multiple stores to the root **Vue** instance looks something like:

```javascript
import Auora from 'auora';
import { Store } from 'auora';

const moduleA = new Store({ ... });
const moduleB = new Store({ ... });

Vue.use(Auora);

const app = new Vue({
  store: {
    moduleA,
    moduleB,
  }
})
```



```html
<template>
  <div>
    <p>{{ paramA1 }}</p>
    <p>{{ paramB1 }}</p>
    <button @click="actionB1">click me</button>
  </div>
</template>

<script>
export default {
  name: 'moduleA',
  store: {
    moduleA: {
      state: ['paramA1']
    },
    moduleB: {
      state: ['paramB1'],
      actions: ['actionB1']
    }
  }
}
</script>
```

<junkyard>


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

## API Based

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



**Method 3**





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

</junkyard>
