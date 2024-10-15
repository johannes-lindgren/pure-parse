# Performance

PureParse is built to be fast, and when dealing with immutable data structures, parsing can be near instantaneous.

> [!TIP]
> For performance benchmarks, see the [Comparison > Benchmarks](comparison#benchmarks) section.

## Just-in-Time (JIT) Compilation

PureParse owes its great performance to just-in-time compilation: when constructing a parser, the argument gets compiled at runtime into a function that can be optimized by V8 (and other JavaScript engines). This technique is used by all the fastest validation libraries.

> [!NOTE]
> Content Security Policy (CSP) can prevent JIT compilation from working. See [Security > Content Security Policy](/guide/security.html#content-security-policy)

## Memoization

Memoization is a useful technique for parsing immutable data—especially if that data changes frequently over time, or if it is important to keep the references in the data stable.

For example, consider a document shared between several peers in a network: when a new peer connects, the entire document is downloaded; but subsequent changes to the document are sent as incremental changes over the network so that the peers only need to update the part of the document that changed. However, for every tiny change, the document needs to be revalidated. If a memoized parser is used, the entire document can be passed to the validation logic without suffering a performance penalty.

Memoization ensures that only the parts of the document that changed are revalidated. Not only does this speed up the parsing time itself, but if other memoizable computations depend on the data, these computations can be memoized as well. For example, if the shared document is rendered on the screen with React, memoized components do not always need to be re-rendered. This can significantly speed up the performance.

Since PureParse is a pure functional library, it is trivial to memoize parsers and guards:

```ts
import { memo, object, parseString, parseNumber } from 'pure-parse'

const parseUsers = memo(
  object({
    name: parseString,
    age: parseNumber,
  }),
)
```

Nested parsers can be memoized:

```ts
import { memo, object, array, parseString, parseNumber } from 'pure-parse'

const parseUsers = memo(
  array(
    memo(
      object({
        name: parseString,
        age: parseNumber,
      }),
    ),
  ),
)
```

> [!TIP]
> There's no use in memoizing parsers for primitive values: while you _can_ wrap them in `memo`, memoization will not occur.

For convenience, each higher order function (`union`, `object`, `array`, etc.) has a memoized counterpart, which lets you write just as compact code as you would with the non-memoized functions:

```ts
import {
  memo,
  objectMemo as object,
  arrayMemo as array,
  parseString,
  parseNumber,
} from 'pure-parse'

const parseUsers = array(
  object({
    name: parseString,
    age: parseNumber,
  }),
)
```

You can create memoized versions of your own parsers [memoizeValidatorConstructor](/api/memoization/memo#memoizevalidatorconstructor):

```ts
const myParserMemo = memoizeValidatorConstructor(myParser)
```

This makes it so that any parser or guard that is constructed is memoized.

> [!NOTE]
> The higher order functions themselves are not memoized—but the parsers they return _are_.

> [!TIP]
> Guard functions can be memoized as well.

## Use Case: Yjs and Immer

For example, consider an example with a CRTD for real-time collaboration:

- [Yjs](https://github.com/yjs/yjs) is a library for creating shared data types that can be used in real-time collaboration.
- [immer-yjs](https://github.com/sep2/immer-yjs) is a library that allows you to use work with Yjs documents as immutable data structures.

In this scenario, the document might be quite large, change frequently over time, and have a large virtual DOM representation. But neither library provides a way to validate the data. By using PureParse, you can parse the data while memoizing the React components.

[memo](/api/memoization/memo.html#memo) takes a parser or guard function as an argument and returns a memoized caches the result for a given input, meaning that if it's invoked

## Pitfalls

To use memoization effectively, you need to be aware of some principles of pure functional programming. There are many resources available on the topic, but here are some key points:

### Pure Parsers

All parsers and guards need to be pure functions. All the functions from PureParse are pure functions, but if you write your own, you need to ensure that they are pure as well.

A pure function is a function that always returns the same output for the same input—it has no side effects. This is crucial to understand because memoization as an optimization technique relies on the fact that computations can be cached.

- If a computation relies on a value from outside its own scope, it may not return the same result for any given input.
- If it produces side effects, it may not produce the same effects if the cache is hit.

> [!INFO]
> In programming, a side effect occurs when a function interacts with anything outside its own scope, such as reading from a file, writing to a database, making a network request, logging to the console, reading from an environmental variable, accessing a global variable, and much more.

### Unecessary Memoization

As long as all parsers are pure, memoization is always safe. However, it is not always necessary: if the references that are passed to the parsers are not stable, memoization will not provide any benefit.

For example, an application that every once in a while fetches a JSON via a REST API will always receive a new reference when that JSON string is parsed into a JavaScript value. Even if that value deeply equals the previous value, the reference will be different, which means that the memoization cache will never be hit.

```

```
