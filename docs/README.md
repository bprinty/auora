---
home: true
heroImage: banner.png
actionText: Get Started →
actionLink: /overview/
footer: MIT Licensed | Copyright © 2020-present Blake Printy
---

<div class="features">
  <div class="feature">
    <h2>Framework-Free <i class="fas fa-fire"></i></h2>
    <p>No tight coupling to any front-end framework.</p>
  </div>
  <div class="feature">
    <h2>Lightweight <i class="fas fa-feather"></i></h2>
    <p>High performance with <2kb of minified & gzipped code.</p>
  </div>
  <div class="feature">
    <h2>Simple <i class="fas fa-glass-martini-alt"></i></h2>
    <p>Simple to understand, simple to implement.</p>
  </div>
</div>

<div class="features">
  <div class="feature">
    <h2>Extensible <i class="fas fa-plug"></i></h2>
    <p>Pre-built hooks for integrations with modern front-end frameworks.</p>
  </div>
  <div class="feature">
    <h2>Fast <i class="fas fa-tachometer-alt"></i></h2>
    <p>Things don't always need to be complex to perform at a high level.</p>
  </div>
  <div class="feature">
    <h2>Scalable <i class="fas fa-layer-group"></i></h2>
    <p>Built to work with applications of all size and complexity.</p>
  </div>
</div>

<down-arrow></down-arrow>
<br /><hr /><br /><br /><br />


<style>
.panels {
  display: flex;
}
.panels .panel-text {
  flex: 40%;
  margin-right: 50px;
}
.panels .panel-code {
  flex: 50%;
}
</style>

<div class="panels">
<div class="panel-text">
<h3>Configure a Store <i class="fas fa-layer-group"></i></h3>
<p>Use three core principles to manage state throughout your application:</p>
<ul>
<li><b>state</b> - Data source for your application.</li>
<li><b>actions</b> - Functions that change state.</li>
<li><b>events</b> - Callbacks throughout the store lifecycle.</li>
</ul>

<br /><br />

<p>This example store manages a counter. There are two actions for changing the counter, and events that will save the history of the counter value as changes are made. <i class="fas fa-arrow-right"></i></p>

</div>
<div class="panel-code">

```javascript
import { Store } from 'auora';

const store = new Store({
  // state
  state: {
    count: 0,
    history: [0],
    operations: [],
  },

  // actions
  actions: {
    // synchronous
    increment({ state }) {
      state.count += 1;
      return state.count;
    },

    // asynchronous
    add({ state }, number) {
      return new Promise((resolve) => {
        state.count = state.count + number;
        resolve(state.count);
      });
    },
  },

  // events
  events: {
    commit(state) {
      state.history.push(state.count);
    },
    dispatch(state, action, ...payload) {
      state.operations.push(action);
    }
  }
});
```

</div>
</div>

<br /><br />

<div class="panels">
<div class="panel-text">
<h3>Apply Actions to Change State <i class="fas fa-star"></i></h3>
<p>After actions execute, they'll commit state change and dispatch events.</p>

</div>
<div class="panel-code">

```javascript
store.state
// {
//   count: 0,
//   history: [0],
//   operations: [],
// }

store.apply.increment();
// {
//   count: 1,
//   history: [0, 1],
//   operations: ['increment'],
// }

store.reset();
// {
//   count: 0,
//   history: [0],
//   operations: [],
// }

store.apply.add(4).then(() => {
  // {
  //   count: 0,
  //   history: [0, 4],
  //   operations: ['add'],
  // }
});
```

</div>
</div>


<br /><br />

<div class="panels">
<div class="panel-text">
<h3>Use Your Favorite Framework <i class="fas fa-bolt"></i></h3>
<p>Auora was built to be framework-agnostic by design.</p>

</div>
<div class="panel-code">

```javascript
// index.js

import Auora from 'auora/ext/vue';
import counterStore from '@/store';

Vue.use(Auora);

const app = new Vue({
  el: '#app',
  store: counterStore
});
```

```html
<!-- Counter.vue -->
<template>
  <div>
    <p>{{ counter }}</p>
    <button @click="increment">Increment Counter</button>
    <button @click="add(5)">Add 5</button>
  </div>
</template>

<script>
export default {
  name: 'counter',
  store: {
    state: ['counter'],
    actions: ['increment', 'add'],
  },
}
</script>
```

</div>
</div>
