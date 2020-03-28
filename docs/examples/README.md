# Examples

Provide code-heavy examples of how to use your package.


## Vue

Provide examples of how to use the package in a Vue app.


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


## React

Provide examples of how to use the package in a React app.


## Svelte

Provide examples of how to use the package in a Svelte app.
