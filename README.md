# useRelatedState()

A React Hook for relating UI state to a list of entities

[![Build Status](https://travis-ci.com/BigAB/use-related-state.svg?branch=master)](https://travis-ci.com/BigAB/use-related-state)

**A Custom React Hook for relating UI state to a list of entities**

Sometimes, when you are creating a component, that component will recieve an array from props, a list of things that represent some entity: a list of todos, people, definitions, etc..., and your UI Element may want to save a little bit of state **for each** of the Entities.

Somtimes it's state such as whether the definition box is open or closed, or whether the item has been selected, or the position it's been dragged to on the screen.

Putting the "extra bit of UI state" (a.k.a. the "Related State") directly on the entity feels wrong, and so this is a simple hook, that takes a list (an array) of entities and returns a list of tuples (also arrays), where the first item is just the item, and the second item is the related state, along with some functions to set the related state for the items.

### Example

```js
import useRelatedState from 'use-related-state'

const SpeakersList = ({ speakers }) => {
  const [speakerTuples, setSpeakerOpen] = useRelatedState(speakers, () => false)

  return speakerTuples.map(([speaker, isOpen]) => (
    <details key={speaker.id} open={isOpen}>
      <summary>{speaker.name}</summary>
      {speaker.bio}
    </details>
  )
}
```

## Installation

```bash
npm install @bigab/use-related-state
```

\*_Note use-related-state requires `react` as a peer dependancy_

## API

```
const [itemStateTuples, setRelatedStateForItem, setRelatedStateForAll] = useRelatedState( items:array(any)[, defaultValueMapper:function, identifier] )
```

#### Arguments

`useRelatedState( items, defaultValueMapper, identifier )`

- `items` - an array of anything
- `defaultValueMapper` **_[optional]_** - a function which recieves and item as an argument and returns the initial value of the related state before any related-state has been updated
- `identifier` **_[optional]_** - a function used to create an identifier "key" to identify the entity. It defaults to `v => v` but if your entity objects are not always the same references, but just data representing those entities, you probably want to pass something like `item => item.id` for the identifier function

#### Returns

`[itemStateTuples, setRelatedStateForItem, setRelatedStateForAll]`

- An array with 3 elements
  - `itemStateTuples` - an array of arrays, where each array element has 2 elements, `[item, relatedState]`, the item item in the 0 index position and the relatedState in the 1 index position
  - `setRelatedStateForItem` - a function that takes 2 arguments `(item, newRelatedState)`, if you need access to the old state, you can pass a function for `newRelatedState` which will be called with the current related state as an argument, and should return the value of the new related state
  - `setRelatedStateForAll` - a function that will be used to map over all the items and return the newRelated state you want to set. It takes a function as an argument, `mapRelatedState`, and that function will recieve the `item` and current `relatedState` and you should return the new related state for each `item` in the items list

_TODO: Examples_

## Changelog

See the [latest releases on GitHub](https://github.com/bigab/use-related-state/releases).

## License

[MIT](./LICENSE)
