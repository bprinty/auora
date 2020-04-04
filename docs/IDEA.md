

## Store Logic

```javascript
const store = new Store({
  state: {
    counter: 0,
    history: [0],
    model: {
      1 : { id: 1, foo: 'bar' }
    },
  },
  actions: {
      add({ state }, value) {
        return axios.post('/counter/add', { value }).then(response => {
          state.tree[state.counter] = response.data.result;
          state.counter = response.data.result;
          state.history.push(state.counter);
        });
      },
      increment({ state }, value) {
        return axios.post('/counter/increment', { value }).then(response => {
          state.tree[state.counter] = response.data.result;
          state.counter = response.data.result;
          state.history.push(state.counter);
        });
      },
  }
});
```

```javascript
store.actions.add(5);
store.actions.increment();
```

```javascript
this.active = []; // array of active promises

...

// all actions are wrapped as promises
const action = this.actions[name];

// if there's currently a change in-flight
if (this.lock === undefined) {
  this.lock = deepCopy(this.state);
}

// dispatch action with state lock
const id = uuid();
this.active.push(id);

action({ state: this.lock }, ...payload).then(() => {
  const newState = deepCopy(this.lock);
  this.lock = newState; // ???
  this.state = newState;
  if (debug) {
    snapshot(newState);
  }
}).finally(() => {
  this.active.pop(id);
  if (this.active.length) {
    this.lock = undefined;
  }
});
```

Dispatch action -> add to state Queue.



## Store Types

| Type | Description |
|------|-------------|
| `strict` | Store update events are dispatched when mutations are explicitly committed. Under this paradigm, data operations are much faster, but developers need to fully replace store parameter values to broadcast state updates. Typically requires more boilerplate code. |
| `transactional` | Store update events are dispatched when 'commit' is explicitly called on state property. Under this paradigm, data update operations are faster, but an explicit `commit()` call is required for broadcasting events. |
| `fluid` | Store update events are dispatched whenever any data is changed within a store. Under this paradigm, data update operations are much slower, but users have much more granular control over what triggers events. |

```javascript
const store = new Store({
  state: {
    obj: {},
  },
  options {
    type: 'strict'
  }
});
```

### Strict Example

```javascript
const store = new Store({
  state: {
    status: 'idle',
    counter: 0,
  },
  actions: {
    add({ commit }, value) {
      commit('status', 'running'); // broadcast 'update' events
      return axios.post('/counter/add', { value }).then(response => {
        commit('counter', response.data.result); // broadcast 'update' events
        return response.data.result;
      }).finally(() => {
        commit('status', 'idle'); // broadcast 'update' events
      });
    }
  }
  options {
    type: 'strict'
  }
});
```

### Transactional Example

```javascript
const store = new Store({
  state: {
    status: 'idle',
    counter: 0,
  },
  actions: {
    state.
    add({ state }, value) {
      return axios.post('/counter/add', { value }).then(response => {
        state.counter = response.data.result;
        return response.data.result;
      }).finally(() => {
        state.status = 'idle';
        state.commit(); // broadcast 'update' events
      });
    }
  }
  options {
    type: 'transactional'
  }
});
```

### Fluid Example

```javascript
const store = new Store({
  state: {
    counter: 0,
  },
  actions: {
    add({ state }, value) {
      state.status = 'idle'; // broadcast 'update' events
      return axios.post('/counter/add', { value }).then(response => {
        state.counter = response.data.result; // broadcast 'update' events
        return response.data.result;
      }).finally(() => {
        state.status = 'idle'; // broadcast 'update' events
      });
    }``
  }
  options {
    type: 'fluid'
  }
});


const user = new User({ ... });
user.commit()

```


## State Constant

.. used particularly in:

1. Storing authentication tokens.
2. Storing base axios instances for authenticating users.

```javascript
const store = new Store({
  state: {
    const: null,
  }
});


state.const.commit('test');
/* contents of `store.state`
{
  const: 'test'
}
*/
```


## State Object

... used particularly in:

1. Storing an indexed collection of models from an external API.
2. Storing singleton data (i.e. profile metadata) from an external API.
3. Storing user-local settings.


```javascript
const store = new Store({
  state: {
    obj: {},
  },
});

state.obj.foo = 'bar';
state.obj.commit();

updatePost() {
  return axios.post('/posts/1', payload).then(response => {
    state.obj[payload.id] = response.data;
    state.obj.commit();
  });
}

myMethod() {
  state.obj.foo = 'bar';
  state.obj.commit();
}

state.obj.commit({ id: 1, name: 'bar' });
/* contents of `store.state`
{
  obj: {
    1: { id: 1, name: 'bar' },
  }
}
*/

state.obj.commit([
  { id: 1, name: 'foo' },
  { id: 2, name: 'baz' }
]);
/* contents of `store.state`
{
  obj: {
    1: { id: 1, name: 'foo' },
    2: { id: 2, name: 'baz' },
  }
}
*/

state.obj.values();
/*
[
  { id: 1, name: 'foo' },
  { id: 2, name: 'baz' },
]
*/

state.obj.reset();
state.obj.commit({ name: 'bar' });
/* contents of `store.state`
{
  obj: {
    name: 'bar',
  }
}
*/

```

This makes it easy to integrate with an external API:

```javascript
const store = Store({
  state: {
    posts: {},    
  },
  actions: {
    fetchPosts({ state }) {
      return axios.get('/posts').then(response => {
        state.posts.commit(response.data);
      });
    },
    createPost({ state }, payload) {
      return axios.post('/posts', payload).then(response => {
        state.posts.commit(response.data);
      });
    },
    updatePost({ state }, payload) {
      return axios.put(`/posts/${payload.id}`, payload).then(response => {
        state.posts.commit(response.data);
      });
    },
    deletePost({ state }, id) {
      return axios.delete(`/posts/${id}`, payload).then(response => {
        state.posts.remove(id);
      });
    }
  }
})


await store.actions.fetchPosts();
/* value of state.posts
{
  1: { id: 1, title: 'foo' },
  2: { id: 2, title: 'bar' },
}
*/

await store.actions.createPost({ title: 'baz' });
/* value of state.posts
{
  1: { id: 1, title: 'foo' },
  2: { id: 2, title: 'bar' },
  3: { id: 3, title: 'baz' },
}
*/

await store.actions.updatePost({ id: 1, title: 'foobar' });
/* value of state.posts
{
  1: { id: 1, title: 'foobar' },
  2: { id: 2, title: 'bar' },
  3: { id: 3, title: 'baz' },
}
*/

await store.actions.deletePost(1);
/* value of state.posts
{
  2: { id: 2, title: 'bar' },
  3: { id: 3, title: 'baz' },
}
*/
```
