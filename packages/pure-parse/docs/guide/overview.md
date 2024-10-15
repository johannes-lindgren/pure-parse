# Overview

PureParse is a lightweight validation library that aims to shift the coupling direction—making type aliases the primary driver for parser structure.

These are the main features and goals of PureParse:

[[toc]]

> [!NOTE]
>
> PureParse follows the [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) principle.

## Declaring Types

Modern validation libraries use TypeScript generics to infer types from schemas, which guarantees type safety. But this approach has a huge downside: the schema becomes the source of truth for the types. This means that if you migrate to another validation library, _you lose all types_.

PureParse takes a different approach: it uses type aliases as the source of truth, letting you type-check the parser structure:

```ts
import { object, parseString, parseNumber } from 'pure-parse'

type User = {
  name: string
  age: number
}

const parseUser = object<User>({
  name: parseString,
  age: parseNumber,
})
```

If the validation function does not match the type, TypeScript will yield an error.

The main benefit of this approach is that the type aliases are decoupled from the validation library, which makes it easier to migrate to another validation library.

Inferred types consist of complex type expressions, which are hard to read. Type aliases declared explicitly are much more readable.

## Inferring Types

You _can_ also infer the type from the parser:

```ts
import { object, parseString, parseNumber, Infer } from 'pure-parse'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})

type User = Infer<typeof parseUser>
```

## Lightweight

[PureParse](https://www.npmjs.com/package/pure-parse) is super-lightweight and has no dependencies. It is also tree-shakeable, and since it exports individual functions rather than classes, bundlers are able to tree-shake away _all_ the functionality that your app is not using.

By having a small size, and by being tree-shakable, [PureParse](https://www.npmjs.com/package/pure-parse) ensures that the final footprint on the application bundle size is minimal. You can use it alongside other validation libraries without worrying about the bundle size.

[Read more](comparison.md#size-comparison)

## Fast

PureParse is [one of the fastest](comparison.md#performance-benchmarks) validators. PureParse owes its great performance to just-in-time compilation: when constructing a parser, the argument gets compiled at runtime into a function that can be optimized by V8 (and other JavaScript engines). This technique is used by all the fastest validation libraries.

> [!NOTE]
> Content Security Policy (CSP) can prevent JIT compilation from working. See [Security > Content Security Policy](/guide/security.html#content-security-policy) for more information.

When working with immutable data structures, [memoization](memoization) can help increase performance by orders of magnitude. It is especially useful when the parsed data is being rendered to the screen with a functional UI library like React. For React to be able to skip re-rendering, the references in the parsed result must be stable, which is achieved with memoization.

## Fail-safe

Another problem with large documents is that just a tiny change can cause the validation to fail. Sometimes, it is acceptable to throw away the part of the document that failed the validation, so that the rest of the document can be used. For example, when working with a backend that did not validate all historically persisted data, you may want to incrementally add validation and type safety to the frontend application.

[Read more](fallbacks.md)

## Extensible and Easy-to-use

Unlike other validation libraries, PureParse has no concept of a schema: instead, users deal exclusively with [parsers](parsers) [gurard](guards). This makes PureParse very easy to extend: when you need a validation function which is not included in the library, you can easily construct it yourself and seamlessly integrate it with the core functionality. The functions in PureParse are not treated any differently than the ones you write yourself\*.

Due to the small size, by design, the library does _not_ contain every feature under the sun. This library focuses on providing foundational building blocks that you can compose to validate most of your data structures.

\*The only exception is `optional`, which is treated specially by `object` to handle optional properties.

## No Throwing, No Side Effects

The library does not throw errors. Instead, it returns a tagged union `Result`.

As the name implies, PureParse is built on pure functional programming principles, meaning that:

- All functions are pure
- No errors are thrown

> [!INFO]
> A function is _pure_ if it always returns the same output for a given input, and if it does not perform any side effects. _Side effects_ include: reading environmental variables, writing to the console, accessing the DOM, performing network requests, reading from a global variable, modifying internal state, mutating arguments, etc.

The library stays away from object-oriented programming, which means that there are no classes. This makes the library tree-shakeable\* and easy to extend.

\*Member functions on classes that are not referenced anywhere in the code cannot be tree-shaken away.

## Other Design Goals

Here's an overview of the principles that guide the development of PureParse:

- **Type safety**—no shortcuts taken, every inferred type is to be trustable. No errors are thrown, since these do not show up in the type signature.
- **Testing** is a cornerstone—the library is built with test-driven development (TDD). Every edge case conceived of will be tested. Even the type transformations are tested with type tests.
- **Documentation** is a must for professionals. Every function must be well documented with type annotations and rich examples.
- **Easy-to-use**
- **Safety**—protect against prototype pollution.

## Out of Scope

There are some things that PureParse does not aim to solve:

- Data serialization and deserialization—PureParse does not cover the type of functionality that `JSON.parse`, `JSON.stringify`, or `parseFloat` do; or any of that kind.
- Asynchronous validation
- Structured error messages—error messages that can be parsed by a machine and translated. PureParse is not built to be used as a user-input validation library.
- Compiled parsers—parsers can be made faster by being compiled from schemas ahead of time.
- Serializable schemas—schemas than can be transmitted over the wire.

If there is sufficient interest from the public, or if the author needs it, some of these features might be added in the future.
