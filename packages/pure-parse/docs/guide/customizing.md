# Custom Parsers and Guards

The API of PureParse is designed to be as simple as possible, so that it is easy to extend the functionality.

> [!NOTE]
> Before writing a custom parser, consider whetehr you can apply a simple transformation on top of a built-in parser. See the [Transformations guide](./transformations.md) for more information.

## Custom Parsers

To create a custom parser, implement a function of the `Parser<?>` type. For example, to create a parser that parses a stringified number from a number:

```ts
import {
  Parser,
  ParseResult,
  success,
  failure,
  isString,
  parseNumber,
} from 'pure-parse'
import { isSuccess } from 'pure-parse/src'

const parseStringifiedNumber: Parser<number> = (data: unknown) => {
  const result = parseNumber(data)
  if (!isSuccess(data)) {
    return result
  }
  return success(result.value.toString())
}
```

> [!TIP]
> The `success` and `failure` functions are simple constructors for the `ParseResult` type and make the code more readable.

Very often though, it's better to use `map` or `chain`:

```ts
const parseStringified = map(parseNumber, (it) => it.toString())
```

## Higher-order Parsers

To create a custom, higher-order parser function, create a generic function that accepts a parser as argument and returns a new parser. Here is a working example with generic trees:

```ts
import { Parser, union, object, equals, arrays } from 'pure-parse'

type Leaf<T> = {
  tag: 'leaf'
  data: T
}
type Tree<T> = {
  tag: 'tree'
  data: (Tree<T> | Leaf<T>)[]
}

// `RequiredParser` means that the user gets an error if they pass an optional parser; for example, `leaf(optional(parseString))`
const leaf =
  <T>(parser: RequiredParser<T>): Parser<Leaf<T>> =>
  (data) =>
    // @ts-expect-error TypeScript gives a false error for the `data` property:
    //  `RequiredParser` guarantees that `parser` does not represent an optional property, yet TypeScript complains
    object({
      tag: equals('leaf'),
      data: parser,
    })(data)

const tree =
  <T>(parser: RequiredParser<T>): Parser<Tree<T>> =>
  (data) =>
    object({
      tag: equals('tree'),
      data: arrays(oneOf(leaf(parser), tree(parser))),
    })(data)
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
  equalsGuard as equals,
  objectGuard as object,
  unionGuard as union,
  arrayGuard as arrays,
} from 'pure-parse'
```

The rest of the code becomes the same as if you were implementing a parser:

```ts
type Leaf<T> = { tag: 'leaf'; data: T }
type Tree<T> = {
  tag: 'tree'
  data: (Tree<T> | Leaf<T>)[]
}

const leafGuard =
  <T>(guard: Guard<T>): Guard<Leaf<T>> =>
  // @ts-expect-error TypeScript gives a false error for the `data` property:
  //  `RequiredGuard` guarantees that `parser` does not represent an optional property, yet TypeScript complains
  (data) =>
    objectGuard({
      tag: equalsGuard('leaf'),
      data: guard,
    })(data)

const treeGuard =
  <T>(guard: Guard<T>): Guard<Tree<T>> =>
  (data) =>
    objectGuard({
      tag: equalsGuard('tree'),
      data: arrayGuard(unionGuard(leafGuard(guard), treeGuard(guard))),
    })(data)
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
