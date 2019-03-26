import { useCallback, useState, useMemo, useRef } from 'react';

const useRelatedState = (
  items,
  defaultMapToState = () => {},
  identifier = v => v
) => {
  const [map, setMap] = useState(() => new Map());

  const tuplesWithRelatedState = useMemo(
    () =>
      items.map(item => {
        const id = identifier(item);
        return [item, map.has(id) ? map.get(id) : defaultMapToState(item)];
      }),
    [items, map, defaultMapToState, identifier]
  );

  const setStateForItem = useCallback(
    (item, newState) =>
      setMap(map => {
        const id = identifier(item);
        const currentState = map.has(id)
          ? map.get(id)
          : defaultMapToState(item);
        if (typeof newState === 'function') {
          newState = newState(currentState);
        }
        if (currentState !== newState) {
          return new Map([...map.entries()].concat([[id, newState]]));
        }
        return map;
      }),
    [setMap, identifier]
  );

  const ref = useRef();
  ref.current = useCallback(
    mapRelatedState => {
      const newStates = items.map(item =>
        mapRelatedState(item, map.get(identifier(item)))
      );
      if (
        items.length !== newStates.length ||
        items.some((item, i) => map.get(identifier(item)) !== newStates[i])
      ) {
        setMap(new Map(items.map((item, i) => [item, newStates[i]])));
      }
    },
    [items, map, setMap, identifier]
  );
  const setAllState = useCallback(
    mapRelatedState => {
      ref.current(mapRelatedState);
    },
    [ref]
  );

  return [tuplesWithRelatedState, setStateForItem, setAllState];
};

export default useRelatedState;
