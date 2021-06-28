# Remake Internals Refactor Brainstorming

## Terminology

- **API**: What the user interacts with. In Remake, it would be the custom attributes.
- **Core**: What the API uses to perform functionality.
- **Controller**: What stores information and handles the API.

## Design Principles

- The API (HTML) must always reflect the data (JSON)
  - The Core doesn't necessarily need to reflect, but must have in mind
- The Core and API are decoupled
  - The Core provides functionality for: DOM manipulation, plugins, event handling, etc.
  - The Core are a series of decouple functions that can have data passed down
  - Every used exported function in the API is a plugin
- The Controller deals with interactions between the API and Core
  - The Controller is like the current Remake namespace, but with several caveats:
  - The Controller mainly deals with holding application related data, such as loaded plugins / data.
  - The Controller also has callable functions (such as `init`, `callFooFunctions`, etc)
- Everything in the API is a plugin, allowing for greater modularity and easy transition to user-provided plugins
- Zero/low dependencies

## Implementation Strategy

### File Structure

The current file system is structured so that each file are categorized based on high-level function. Although this is a valid way of organizing code, it is overall confusing when maintaining a semi-large application library. To fix this issue, the file structure needs to be refactored. A possible way to group is to do:

```
utils/
  log.js
  dom-api-helpers.js
  so on...
core/
  init.js
  getKeys.js
  so on...
api/
  edit.js
  object.js
  new.js
  key.js
  so on...
controller.js
index.js
```

### API functions

Each API attribute **must have a default export of a data that pertains to the attribute**.

```js
...

import { Plugin } from '../core/plugin';
import { getNearestKey, so on... } from '../core/dom-api-helpers';

const fooAttribute = new Plugin(
  {
    type: 'mutator / accessor' /* changes what props are available */
  },
  ({ data, event, so on... }) => {
    // so on...
  }
);

export default fooAttribute;
```

This ensures that creating new attributes is insanely easy - attributes can be removed, additional ones can be added, etc.

### Core functions

Currently, the Remake architecture requires the developer to reimplement a lot of the same fundemental functionality in slightly different ways.

- DOM Manipulation

```js
export const addEventListener = (el, event, callback) => {
  const fn = () => {
    if (el[event]) el[event]();
    callback();
  }
  el.addEventListener(event, fn);
  el[event] = fn;
}

export const getEventListener = (el, event) => {
  return el[event];
}

export const removeEventListener = (el, event) => {
  el.removeEventListener(event, el[event]);
}
```

- Plugins

```js
export class Plugin {
  constructor({ hooks, type }, run) {
    this.hooks = hooks;
    this.run = run;
    this.type = type;
  }

  init() {
    if (this.hooks.init) this.hooks.init();

    // use this.type to detect mutator/accessor/other types
  }

  destroy() {
    if (this.hooks.destroy) this.hooks.destroy();

    // remove all event listeners
  }

  // Hook-based controls
}
```