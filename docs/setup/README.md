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

There are several configuration options you can change when using this module. The list below will likely grow throughout the lifecycle of this project:

| Option | Description | Default |
|--------|-------------|---------|
| `transactions` | Toggle transactional support when *actions* are dispatched from store. Setting this value to `false` can improve performance. | `true` |

Here is how you can set specific options when creating [Store](/guide/README.md#store) objects from this library:

```javascript
const store = new Store({
  state: { ... },
  options: {
    transactions: true,
  }
});
```

::: tip

The code above also highlights all of option defaults.

:::
