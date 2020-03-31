# Examples

Provide code-heavy examples of how to use your package.


## Vue

Provide examples of how to use the package in a Vue app.

::: warning

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

:::


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

state = new State({ state, getters });
```

```javascript
export default {
    name: 'todo-component',
    store: {
      state: ['todos'],
      getters: ['getDoneTodos'],
      sync: {
        todos: [fetchTodos, completeTodo]
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

Provide examples of how to use the package in a React app.


## Svelte

Provide examples of how to use the package in a Svelte app.
