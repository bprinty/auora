# Patterns

As with any middleware library, there are architectural decisions developers need to make so that they don't accrue technical debt over the lifecycle of the software they're developing. This section provides some detail and guidance around the nuances of different architectural patterns users might choose for their project. Below is an overview of what will be covered:

1. [Declarative Syntax](#declarative-syntax) - An alternative to the explicit syntax outlined in previous [sections](/guide/), which may help produce more readable and maintainable code (depending on developer preferences).
2. [Application Structure](#application-structure) - Tips for how to structure large applications with complex stores.
3. [Modules](#modules) - How to use multiple stores in an application for different logical blocks of functionality.

<!--
4. [Syncing Actions](#syncing-actions) - Guidelines for importing existing API utilities into a store as actions.
-->


## Declarative Syntax

Along with the explicit syntax described in the [Guide](/guide/) section of the documentation, you can also define store constructs in a more declarative way. For example, here is how to define our [counter](/guide/README.md#store) example with this alternative syntax:

```javascript
// counter store property
const counter = {
  default: 0,
  mutations: {
    increment: value => value + 1,
  },
  actions: {
    increment(value) {
      return axios.post('/counter/increment').then(response => response.data.result);
    }
  }
}

// instantiate store with module
store = new Store({
  counter,
});
```

This type of shorthand is made possible by making a few assumptions about `state` updates:

1. The value *returned* from mutations is used to update the value of parent `store` param.
2. The value *returned* from actions is used to directly update the value of a parent `store` param.


::: tip NOTE

The first argument to **actions** and **methods** declared using this stynax is always the current value of the associated state parameter.

:::


This may seem like a trivial syntactic pivot, but it becomes more useful when you're dealing with many state properties for data models across an application. It also helps for maintainability to see all mutations/actions associated with a specific state property in the same block of code. To illustrate this, let's consider an application where we need to manage data models for `authors` and `posts`:


```javascript
/**
* Author model.
*/
const authors = {
  default: {},
  actions: {
    fetch(authors) {
      return axios.get('/authors').then(response => response.data);
    },
    create(authors, payload) {
      return axios.post('/authors', payload).then(response => {
        const author = response.data;
        authors[author.id] = author;
        return authors;
      });
    }),
    update(authors, id, payload) {
      return axios.put('/authors/' + id, payload).then(response => {
        const author = response.data;
        Object.assign(authors[author.id], author);
        return authors;
      });
    }),
  }
}

/**
 * Posts model
 */
const posts = {
  default: {},
  actions: {    
    fetch(posts) {
      return axios.get('/posts').then(response => response.data);
    },
  }
}

// instantiate store with module
const store = new Store({
  authors,
  posts,
});
```

With the definitions above, we're able to perform the following operations (via actions):

```javascript
// authors
const authors = await store.dispatch('authors.fetch');
const newAuthor = await store.dispatch('authors.create', { name: 'Foo Bar' });
const updatedAuthor = await store.dispatch('authors.update', newAuthor.id, { name: 'Bar Baz' });

// posts
const posts = await store.dispatch('posts/fetch');
```


Now, let's show an alternative store declaration for context, defining these data models with the syntax highlighted in the [Guide](/guide/) section of the documentation:

```javascript
const store = {
  authors: {},
  posts: {},
};

const actions = {
  'authors.fetch': ({ commit }) => {
    return axios.get('/authors').then(response => {
      commit('authors', response.data);
      return response.data
    });
  },
  'authors.create': ({ commit }, payload) => {
    return axios.post('/authors', payload).then(response => {
      commit('authors.add', response.data);
      return response.data
    });
  },
  'authors.update': ({ commit }, id, payload) => {
    return axios.put('/authors/' + id, payload).then(response => {
      commit('authors.sync', response.data);
      return response.data
    });
  },
  'posts.fetch': ({ commit }) => {
    return axios.get('/posts').then(response => {
      commit('posts', response.data);
      return response.data
    });
  },
};

const store = new Store({
  store,
  actions
});
```

Comparing these two side-by-side, you can see how it might be beneficial for clarity to define data models in an isolated way. However, syntactic preference is obviously subjective and will vary based on differences in background and individual coding style. Users are encouraged to use any style that might best fit their application.


## Application Structure

This library was designed to be flexible and adapt to different architectural patterns that both small- and large-scale applications require.

To help with discussing different types of project organization, here is an example of the directory structure for a typical small-scale application using a modern framework:


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
    ├── api.js
    └── store.js
...
```

Note the `store.js` file containing the **Store** definitions for this package. Warehousing all store constructs in a separate file is a good way to organize code.

Each modern framework will have a slightly different layout, but that generally captures how small projects are organized. Large projects typically break out into a more modular structure. For example:

```
project/
├── package.json
└── src
    ├── index.js
    ├── router.js
    └── modules/
        ├── profile/
        │   ├── views/
        │   │   └── ...
        │   ├── components/
        │   │   └── ...
        │   ├── index.js
        │   ├── router.js
        │   ├── api.js
        │   └── store.js
        ├── feed/
        │   ├── views/
        │   ├── components/
        │   ├── index.js
        │   ├── router.js
        │   ├── api.js
        │   └── store.js
        ...
```

In this directory structure, note the module-specific `store.js` files that contain **Store** definitions for each module.

Inside each of the module `store.js` files, you can export a store that is specific to that portion of the application:

```javascript
// contents of src/modules/profile.js
export default const new Store({
  state: { ... },
  actions: { ... }
});
```

And then Inside the root `src/index.js`, you can import the other stores as store modules. For example, here is how you'd do that in a **Vue** application:

```javascript
// contents of index.js
import Auora from 'auora/plugins/vue';

import profile from '@/src/modules/profile/store';
import feed from '@/src/modules/feed/store';

Vue.use(Auora);

const app = new Vue({
  store: {
    profile,
    feed,
  }
});
```

See the [Vue](https://v1.vuejs.org/guide/application.html) and [React](https://reactjs.org/docs/faq-structure.html) guidelines for more information on how to structure large projects.


## Modules

We've alluded to using modules in previous sections of the documentation, but now let's go over the concept of **modules** more specifically.

As an example, in a **Todo List** application, we might want to have separate stores for 1) managing a user's profile information, and 2) managing a user's todo list. Data management across each of those stores operates independently, so we don't technically need to make them connected in any way by putting them in the same store. Here is what defining multiple stores for that use case might look like:

::: danger Incomplete

The code example immediately below is incomplete.

:::

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
    fetch: (store) => store
    add:
    complete:
  }
})


// use an action from the `profile` store.
await profile.dispatch('login', { email: '', password: '' });

// use an action from the `todos` store.
await todos.dispatch('fetch');
```

Breaking out isolated functionality into separate modules can help with code maintenance and readability. It also helps teams [isolate](https://en.wikipedia.org/wiki/Separation_of_concerns) the effects of changes as they're made to your project.

In a Vue project, declaring and binding multiple stores to the root **Vue** instance looks something like:

```javascript
// contents of src/index.js
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

Once the **stores** have been bound to a **Vue** project, you can use them in a **Component** like so:

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

For more example on how to use store modules in other frontend frameworks like **React** or **Svelte**, see the [Examples](/examples/) section of the documentation.

<!--

TODO: THINK ABOUT THIS A LITTLE BIT MORE BEFORE IMPLEMENTING -- PERHAPS REVISIT AFTER WORKING THROUGH VUE EXAMPLES

## Syncing Actions

When working on a large applcation with c

```javascript

import { map } from 'auora';

function incrementCounter() {
  return axios.post('/counter/').then(response => response.data.result);
}

function addToCounter(value) {
  return axios.post('/counter/add', { amount: value }).then(response => response.data.result);
}

const store = new Store({
  state: {
    counter: 0,
  }
  sync: {
     counter: [
       incrementCounter,
       addToCounter
     ],
  }
});
```

With the [Declarative](#declarative) syntax described above, you can sync existing API methods using the following syntax:

```javascript
const counter = {
  default: 0,
  sync: [
    incrementCounter,
    addToCounter
  ]
};

const store = new Store({ counter });
```

```javascript
// use api method outside store
await addToCounter(5);

// use api method and sync with store
await store.actions.addToCounter(5);
```

In a component, this feels even more natural:

```html
<template>
  <div>
    <p>{{ counter }}</p>
    <button @click="incrementCounter">increment counter</button>
    <button @click="addToCounter(5)">add 5 to counter</button>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'counter',
  store: {
    state: ['counter'],
    sync: {
      counter: [
        api.incrementCounter,
        api.addToCounter,
      ]
    }
  }
}
</script>
```



Revisiting our [authors/posts](#declarative) example above, here's how we could structure our application:

```javascript
// contents of api.js
const authors = {
  fetch: () => axios.get('/authors').then(response => response.data),
  create: data => axios.post('/authors', data).then(response => response.data),
  update: (id, data) => axios.put('/authors/' + id, data).then(response => response.data),
};

const posts = {
  fetch: () => axios.get('/posts').then(response => response.data),
};
```

```javascript
// contents of store.js
const authors = {
  default: {},
  sync: {
    fetch: api.authors.fetch,
    create: api.authors.create,
    update: api.authors.update
  },
};

const posts = {
  default: {},
  sync: {
    fetch: api.posts.fetch
  }
};

// instantiate store with module
const store = new Store({
  authors,
  posts,
});
```

You can use the functionality above like:

```javascript
// issue api requests outside of store
const authors = await api.authors.fetch();
await api.authors.update(authors[0].id, { name: 'Foo Bar' });

// update store after changes
const authors = await store.dispatch('authors.fetch');
await store.dispatch('authors.update', authors[0].id, { name: 'Foo Bar' });
```

 -->


<br />
---
---
<br />


::: danger THAT'S IT!

You've reached the end of this section of the documentation. Thanks for reading until the end!

:::

If you have any questions that aren't answered by this documentation, feel free to file a `documentation` issue in the [GitHub Issue Tracker](https://github.com/bprinty/auora) for this project.
