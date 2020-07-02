# API

## Event Management

Auora maintains its own publish-subscribe implementation for brodcasting events that happen thoughout the **Store** lifecycle. The API for the `PubSub` manager is below:

### PubSub

/autodoc src/pubsub.js PubSub


## Store

This section details classes related to the global **Store** object and available methods.

### Store

/autodoc src/store.js Store


### Status Manager

/autodoc src/store.js StatusManager


## Observable

The observable object is currently undocumented, but provides a useful tool for managing data that needs to broadcast updates for deeply nested state changes. Here is a minimal example showing how the object can be used:

```javascript
let track = [];
const obj = new Observable({
  foo: 'bar',
  bar: [1, 2],
  baz: { id: 1 },
}, () => { // base callback, execute every time a change is made
  track.push('base');
});
obj.subscribe('foo', () => {
  track.push('foo');
});
obj.bar.subscribe(() => {
  track.push('bar');
});
obj.bar.subscribe(0, () => {
  track.push('bar.0');
});
obj.baz.subscribe('id', () => {
  track.push('baz.id');
});

// test property subscriptions
track = [];
obj.foo = 'test';
//  track -> ['foo', 'base']

track = [];
obj.bar.push(1);
//  track -> ['base', 'bar']

track = [];
obj.bar[0] = 1;
//  track -> ['bar.0', 'base', 'bar']

track = [];
obj.baz.id = 2;
//  track -> ['baz.id', 'base']
```

### Observable

/autodoc src/proxy.js Observable
