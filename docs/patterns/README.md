# Patterns

As with any middleware library, there are architectural decisions developers need to make so that they don't accrue technical debt over the lifecycle of the software they're developing. This section provides some detail and guidance around the nuances of different architectural patterns users might choose for their project. Below is an overview of what will be covered:

1. [Application Structure](#application-structure) - Tips for how to structure large applications with complex stores.
2. [Modules](#modules) - How to use multiple stores in an application for different logical blocks of functionality.
3. [Dynamic Registration](#dynamic-registration) - How to dynamically register store constructs.


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
import Auora from 'auora/ext/vue';

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

```javascript
const profile = new Store({
  state: {
    name: '<anonymous>',
  },
  actions: {
    login({ state }, { email, password }) {
      return axios.post('/login').then(response => {
        state.name = response.data.name;
      });
    },
  },
})

const todos = new Store({
  state: {
    todos: []
  }
  actions: {
    fetch({ state }) {
      return axios.get('/todos').then(response => {
        state.todos = response.data;
      });
    },
    create({ state }, payload) {
      return axios.post('/todos', { payload }).then(response => {
        state.todos.push(response.data);
      });
    }
  }
});


// use an action from the `profile` store.
await profile.apply.login({ email: '', password: '' });

// use an action from the `todos` store.
await todos.apply.fetch();
await todos.apply.create({ text: 'Foo bar', complete: false });
```

Breaking out isolated functionality into separate modules can help with code maintenance and readability. It also helps teams [isolate](https://en.wikipedia.org/wiki/Separation_of_concerns) the effects of changes as they're made to your project.

In a Vue project, declaring and binding multiple stores to the root **Vue** instance looks something like:

```javascript
// contents of src/index.js
import Auora from 'auora/ext/vue';
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


## Dynamic Registration

Dynamically registering store constructs can be useful for some types of applications that utilize [metaprogramming](https://en.wikipedia.org/wiki/Metaprogramming) techniques. To show how dynamically registering constructs works, consider another `counter` store:

```javascript
const store = new Store({
  state: {
    count: 0,
  },
  actions: {
    increment({ state }) {
      state.count += 1;
      return state.count;
    },
  },
});
```

Elsewhere in the application, it might be useful to augment store functionality by adding another action. To do this, use the `store.register()` method:

```javascript
store.register({
  actions: {
    add({ state }, number) {
      return new Promise((resolve) => {
        state.count = state.count + number;
        resolve(state.count);
      });
    },
  }
});

// use action
await store.apply.add(5);
```

This will dynamically register input as if it were included when the `Store` was initially instantiated. You can similarly do the same with `state`, and `getters`. Here is an example showing the syntax:

```javascript
store.register({
  state: {
    newParam: null,
  },
  getters: {
    getNewParam: state => state.newParam,
  },
  actions: {
    ...
  }
});
```

---
---
<br />

::: danger THAT'S IT!

You've reached the end of this section of the documentation. Thanks for reading until the end!

:::

If you have any questions that aren't answered by this documentation, feel free to file a `documentation` issue in the [GitHub Issue Tracker](https://github.com/bprinty/auora) for this project.
