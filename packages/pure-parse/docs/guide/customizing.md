# Customizing

The API of PureParse is designed to be as simple as possible, so that it is easy to extend the functionality.

## Custom Parsers

To create a custom parser, implement a function of the `Parser<?>` type. For example, to create a parser that parses a number from a string, write:

```ts
import { Parser, ParseResult, success, failure, isString } from 'pure-parse'

export const parseNumberFromString: Parser<number> = (data: unknown) => {
  if (!isString(data)) {
    return failure('Expected a string')
  }
  const parsed = Number(data)
  return data !== '' &&
    !hasWhiteSpace(data) &&
    !isNaN(parsed) &&
    isFinite(parsed)
    ? success(parsed)
    : failure(
        `The string could not be parsed into a number: got ${JSON.stringify(
          str,
        )}`,
      )
}
```

> [!TIP]
> The `success` and `failure` functions are simple constructors for the `ParseResult` type and make the code more readable.

## Higher-order Parsers

To create a custom, higher-order parser function, create a generic function that accepts a parser as argument and returns a new parser. Here is a working example with generic trees:

```ts
import { Parser, union, object, literal, array } from 'pure-parse'

export type Leaf<T> = { tag: 'leaf'; data: T }
export type Tree<T> = {
  tag: 'tree'
  data: (Tree<T> | Leaf<T>)[]
}
export const leaf =
  <T>(parser: Parser<T>) =>
  (data: unknown): data is Leaf<T> =>
    object({
      tag: literal('leaf'),
      data: parser,
    })(data)

export const tree =
  <T>(parser: Parser<T>) =>
  (data: unknown): data is Tree<T> =>
    union(
      leaf(parser),
      object({
        tag: literal('tree'),
        data: array(union(leaf(parser), tree(parser))),
      }),
    )(data)
```

which will parse (and infer the type of) the following data:

```ts
const myTree: Tree = {
  tag: 'tree',
  data: [
    {
      tag: 'leaf',
      data: 'package.json',
    },
    {
      tag: 'tree',
      data: [
        {
          tag: 'leaf',
          data: 'index.ts',
        },
      ],
    },
  ],
}

const parseTree = tree(isString)
```

## Higher-order Guards

To do the same with a validator, simply import the guard functions as alias them:

```ts
import {
  Guard,
  literalGuard as literal,
  objectGuard as object,
  unionGuard as union,
  arrayGuard as array,
} from 'pure-parse'
```

The rest of the code becomes the same as if you were implementing a parser:

```ts
export type Leaf<T> = { tag: 'leaf'; data: T }
export type Tree<T> = {
  tag: 'tree'
  data: (Tree<T> | Leaf<T>)[]
}
export const leafGuard =
  <T>(guard: Guard<T>) =>
  (data: unknown): data is Leaf<T> =>
    object({
      tag: literal('leaf'),
      data: guard,
    })(data)

export const tree =
  <T>(guard: Guard<T>) =>
  (data: unknown): data is Tree<T> =>
    union(
      leaf(guard),
      object({
        tag: literal('tree'),
        data: array(union(leaf(guard), tree(guard))),
      }),
    )(data)
```

This will validate (and infer the type of) the following data:

```ts
const myTree: Tree = {
  tag: 'tree',
  data: [
    {
      tag: 'leaf',
      data: 'package.json',
    },
    {
      tag: 'tree',
      data: [
        {
          tag: 'leaf',
          data: 'index.ts',
        },
      ],
    },
  ],
}

const isTree = tree(isString)
```
