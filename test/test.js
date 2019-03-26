const { renderHook, act } = require('react-hooks-testing-library');
const useRelatedState = require('..');
const { cloneDeep } = require('lodash');

function testCases(description, testFn, cases) {
  describe(description, () => {
    cases.forEach(({ name, ...testData }) => {
      test(
        name,
        testFn.length > 1
          ? done => testFn(done, testData)
          : () => testFn(testData)
      );
    });
  });
}

testCases(
  'returns an array of tuples (arrays) of items and relatedStates (default undefined)',
  ({ options }) => {
    const { result } = renderHook(() => {
      return useRelatedState(options);
    });
    const [tuples] = result.current;
    expect(tuples).toEqual([
      [options[0], undefined],
      [options[1], undefined],
      [options[2], undefined],
    ]);
  },
  [
    { name: 'with strings', options: ['one', 'two', 'three'] },
    { name: 'with numbers', options: [1, 2, 3] },
    {
      name: 'with objects',
      options: [{ one: 1 }, { two: 2 }, { three: 3 }],
    },
  ]
);

testCases(
  'can take a defaultStateMapper function as the second argument to set default state',
  ({ options, expected }) => {
    const { result } = renderHook(() => {
      return useRelatedState(options, item => ({
        value: JSON.stringify(item),
      }));
    });
    const [tuples] = result.current;
    expect(tuples).toEqual([
      [options[0], expected[0]],
      [options[1], expected[1]],
      [options[2], expected[2]],
    ]);
  },
  [
    {
      name: 'with strings',
      options: ['one', 'two', 'three'],
      expected: [{ value: `"one"` }, { value: `"two"` }, { value: `"three"` }],
    },
    {
      name: 'with numbers',
      options: [1, 2, 3],
      expected: [{ value: '1' }, { value: '2' }, { value: '3' }],
    },
    {
      name: 'with objects',
      options: [{ one: 1 }, { two: 2 }, { three: 3 }],
      expected: [
        { value: `{"one":1}` },
        { value: `{"two":2}` },
        { value: `{"three":3}` },
      ],
    },
  ]
);

test('can take a function as a third argument that maps each item to an identifier for relatedState', () => {
  const entities = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const { result, rerender } = renderHook(
    opts => {
      return useRelatedState(opts, () => false, item => item.id);
    },
    { initialProps: cloneDeep(entities) }
  );

  const [, setStateForItem] = result.current;
  act(() => {
    setStateForItem(entities[1], { foo: 'bar' });
  });

  rerender(cloneDeep(entities));

  expect(result.current[0]).toEqual([
    [entities[0], false],
    [entities[1], { foo: 'bar' }],
    [entities[2], false],
  ]);

  rerender(cloneDeep(entities));

  act(() => {
    setStateForItem(entities[2], { baz: 'pip' });
  });

  expect(result.current[0]).toEqual([
    [entities[0], false],
    [entities[1], { foo: 'bar' }],
    [entities[2], { baz: 'pip' }],
  ]);
});

describe('returns updater function `setStateForItem` which can set the related state for an item and have it persits across renders', () => {
  testCases(
    'setStateForItem updates the related state for a given item',
    ({ options }) => {
      const { result } = renderHook(() => {
        return useRelatedState(options);
      });
      const [, setStateForItem] = result.current;

      act(() => {
        setStateForItem(options[1], { foo: 'bar' });
      });

      const tuples = result.current[0];

      expect(tuples).toEqual([
        [options[0], undefined],
        [options[1], { foo: 'bar' }],
        [options[2], undefined],
      ]);
    },
    [
      { name: 'with strings', options: ['one', 'two', 'three'] },
      { name: 'with numbers', options: [1, 2, 3] },
      {
        name: 'with objects',
        options: [{ one: 1 }, { two: 2 }, { three: 3 }],
      },
    ]
  );

  testCases(
    'setStateForItem can take a function instead of state, this function will be called with the current state',
    ({ options, expected }) => {
      const { result } = renderHook(() => {
        return useRelatedState(options, item => ({
          json: JSON.stringify(item),
        }));
      });
      let [, setStateForItem] = result.current;

      act(() => {
        setStateForItem(options[1], relatedState => {
          return {
            ...relatedState,
            value: JSON.parse(relatedState.json),
          };
        });
      });

      const tuples = result.current[0];

      expect(tuples).toEqual([
        [options[0], expected[0]],
        [options[1], expected[1]],
        [options[2], expected[2]],
      ]);
    },
    [
      {
        name: 'with strings',
        options: ['one', 'two', 'three'],
        expected: [
          { json: `"one"` },
          { json: `"two"`, value: 'two' },
          { json: `"three"` },
        ],
      },
      {
        name: 'with numbers',
        options: [1, 2, 3],
        expected: [{ json: '1' }, { json: '2', value: 2 }, { json: '3' }],
      },
      {
        name: 'with objects',
        options: [{ one: 1 }, { two: 2 }, { three: 3 }],
        expected: [
          { json: JSON.stringify({ one: 1 }) },
          { json: JSON.stringify({ two: 2 }), value: { two: 2 } },
          { json: JSON.stringify({ three: 3 }) },
        ],
      },
    ]
  );

  // rethink how to make this work. May have to lose lazy defaults
  test.skip('it should do nothing if it is passed an item that has no related state', () => {
    let count = 0;
    const { result } = renderHook(() => {
      count++;
      return useRelatedState([1, 2, 3]);
    });
    const [, setStateForItem] = result.current;
    expect(count).toBe(1);

    act(() => {
      setStateForItem(5, {});
    });
    expect(count).toBe(1);

    const [tuples] = result.current;
    expect(tuples).toEqual([[1, undefined], [2, undefined], [3, undefined]]);
  });
});

testCases(
  'returns an updateAll function, which accepts a mapper function to map each item and related state to new related state',
  ({ options, mapperFn }) => {
    const { result } = renderHook(() => {
      return useRelatedState(options);
    });
    const [, , setStateForAllItems] = result.current;
    expect(result.current[0]).toEqual([
      [options[0], undefined],
      [options[1], undefined],
      [options[2], undefined],
    ]);

    act(() => {
      setStateForAllItems(mapperFn);
    });

    expect(result.current[0]).toEqual([
      [options[0], 1],
      [options[1], 2],
      [options[2], 3],
    ]);

    act(() => {
      setStateForAllItems((item, relatedState) => `Answer is ${relatedState}`);
    });

    expect(result.current[0]).toEqual([
      [options[0], 'Answer is 1'],
      [options[1], 'Answer is 2'],
      [options[2], 'Answer is 3'],
    ]);
  },
  [
    {
      name: 'with strings',
      options: ['one', 'two', 'three'],
      mapperFn: item => ({ one: 1, two: 2, three: 3 }[item]),
    },
    { name: 'with numbers', options: [1, 2, 3], mapperFn: n => n },
    {
      name: 'with objects',
      options: [{ one: 1 }, { two: 2 }, { three: 3 }],
      mapperFn: item => item[Object.keys(item)[0]],
    },
  ]
);
