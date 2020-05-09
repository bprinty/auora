# Install

## Install in Project

To use this library in a project, add the package to your package dependencies via:

```bash
npm install --save auora
```

Or, with [yarn](https://yarnpkg.com/):

```bash
yarn add auora
```

## Use via CDN

To use this package via CDN, import it in your project via:

```html
<script src="https://unpkg.com/auora/dist/index.min.js"></script>
```

## Configuration

Once you've added the package to your project, you can import the `Store` object and use it like so:

```javascript
import { Store } from 'auora';

const store = new Store({
  // state
  state: {
    count: 0,
  },

  // actions
  actions: {
    increment({ state }) {
      state.count += 1;
      return state.count;
    },
  },
});
```

See the [Guide](/guide/) section of the documentation for more information on how to fully utilize all of the features this library provides.

## Options

There are several configuration options you can change when using this module. The list below will likely grow throughout the lifecycle of this project:

| Option | Description | Default |
|--------|-------------|---------|
| `recurse` | Recursively commit data during state transactions. This will slow down applications storing a lot of state data  but will enable an easier API for updating deeply nested data. | `false` |

Here is how you can set specific options when creating [Store](/guide/README.md#store) objects from this library:

```javascript
const store = new Store({
  state: { ... },
  options: {
    recurse: false,
  }
});
```

::: tip

The code above shows all of option defaults.

:::
