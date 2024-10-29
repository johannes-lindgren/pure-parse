# Performance

PureParse is built to be among the fastest validation libraries. This article outlines some of the techniques to use to speed up the parsing even further.

> [!TIP]
> For performance benchmarks, see the [Comparison > Benchmarks](comparison#benchmarks) section.

## Memoization

When using the structural sharing technique, memoization can be employed to make parsing near instantaneous. Since PureParse is a pure functional library, it is trivial to memoize parsers and guards:

```ts
import { memo, object, parseString, parseNumber } from 'pure-parse'

const parseUsers = memo(
  object({
    name: parseString,
    age: parseNumber,
  }),
)
```

Nested parsers can also be memoized:

```ts
import { memo, object, arrays, parseString, parseNumber } from 'pure-parse'

const parseUsers = memo(
  arrays(
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

For convenience, each higher order function (`union`, `object`, `arrays`, etc.) has a memoized counterpart, which lets you write just as compact code as you would with the non-memoized functions:

```ts
import {
  memo,
  objectMemo as object,
  arrayMemo as arrays,
  parseString,
  parseNumber,
} from 'pure-parse'

const parseUsers = arrays(
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

## When to Memoize

Memoization is a useful technique for parsing immutable data—especially if that data changes frequently over time, or if it is important to keep the references in the data stable.

For example, consider a document shared between several peers in a network: when a new peer connects, the entire document is downloaded; but subsequent changes to the document are sent as incremental changes over the network so that the peers only need to update the part of the document that changed. However, for every tiny change, the document needs to be revalidated. If a memoized parser is used, the entire document can be passed to the validation logic without suffering a performance penalty.

Memoization ensures that only the parts of the document that changed are revalidated. Not only does this speed up the parsing time itself, but if other memoizable computations depend on the data, these computations can be memoized as well. For example, if the shared document is rendered on the screen with React, memoized components do not always need to be re-rendered. This can significantly speed up the performance.

## Memoization Use Case with Yjs and Immer

For example, consider an example with a CRTD for real-time collaboration:

- [Yjs](https://github.com/yjs/yjs) is a library for creating shared data types that can be used in real-time collaboration.
- [immer-yjs](https://github.com/sep2/immer-yjs) is a library that allows you to use work with Yjs documents as immutable data structures.

In this scenario, the document might be quite large, change frequently over time, and have a large virtual DOM representation. But neither library provides a way to validate the data. By using PureParse, you can parse the data while memoizing the React components.

[memo](/api/memoization/memo.html#memo) takes a parser or guard function as an argument and returns a memoized caches the result for a given input, meaning that if it's invoked

## Pitfalls of Memoization

To use memoization effectively, you need to be aware of some principles of pure functional programming. There are many resources available on the topic, but here are some key points:

### Pure Parsers

All parsers and guards need to be pure functions. All the functions from PureParse are pure functions, but if you write your own, you need to ensure that they are pure as well.

A pure function is a function that always returns the same output for the same input—it has no side effects. This is crucial to understand because memoization as an optimization technique relies on the fact that computations can be cached.

- If a computation relies on a value from outside its own scope, it may not return the same result for any given input.
- If it produces side effects, it may not produce the same effects if the cache is hit.

> [!INFO]
> In programming, a side effect occurs when a function interacts with anything outside its own scope, such as reading from a file, writing to a database, making a network request, logging to the console, reading from an environmental variable, accessing a global variable, and much more.

### Unnecessary Memoization

As long as all parsers are pure, memoization is always safe. However, it is not always necessary: if the references that are passed to the parsers are not stable, memoization will not provide any benefit.

For example, an application that every once in a while fetches a JSON via a REST API will always receive a new reference when that JSON string is parsed into a JavaScript value. Even if that value deeply equals the previous value, the reference will be different, which means that the memoization cache will never be hit.

## Compiled Validators

When memoization does not provide any benefits, parsing performance may still be increased by using the just-in-time (JIT) [compiled parsers](/api/parsers/object#objectCompiled):

```ts
import { objectCompiled, parseNumber, parseString } from 'pure-parse'

const parseUser = objectCompiled({
  name: parseString,
  age: parseNumber,
})
```

The resulting parser has exactly the same API as the non-compiled version, but parses data _much_ faster.

> [!TIP]
> See the [performance benchmarks](comparison#safe-parsing) section for more information.

There are two caveats of using compiled parsers:

1. They use the `Function` constructor, which may be disallowed in some environments; for example, in a browser page with a strict Content Security Policy. See the [Security](/guide/security#content-security-policy) article for more information.
2. While parsing performance is increased, the _construction_ of the parser takes more time. If the parser is constructed at the module level, this can slow down the application startup time. See the [Lazy Construction of Parsers](#lazy-construction-of-parsers) section for more information.

## Lazy Construction of Parsers

Construction of parsers does have a tiny overhead: it takes about half the time to construct a parser as it does to validate a value with that parser.

However, the just-in-time (JIT) [compiled parsers](/api/parsers/object#objectJit) take about 50 times longer to construct than their non-JIT counterparts. If a project defines a lot of JIT-compiled parsers at the module level, it _can_ be worth deferring their initialization with the [lazy](/api/common/lazy) higher-order function:

```ts
import { lazy, parseString, parseNumber, objectCompiled } from 'pure-parse'

const parseUser = lazy(() =>
  objectCompiled({
    name: parseString,
    age: parseNumber,
  }),
)

// The API of the parser does not change
parseUser({
  name: 'Alice',
  age: 42,
})
```

> [!TIP]
> Do not optimize prematurely: only use `lazy` if you have a performance problem.
