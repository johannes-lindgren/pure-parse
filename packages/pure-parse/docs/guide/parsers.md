# Parsers

Parsers are functions that accepts an `unknown` argument and returns a discriminated union, which is either a success or a failure:

```ts
type Parser<T> = (data) => ParseResult<T>
```

where `ParseResult` is a discriminated union:

```ts
type ParseResult<T> =
  | { tag: 'success'; value: T }
  | { tag: 'failure'; error: string }
```

To find out whether the parsing was successful, read the `tag` property of the result; for example:

```ts
import { parseString, parseNumber, object } from 'pure-parse'
import data from 'my-data.json'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})

const result = parseUser(data)

switch (result.tag) {
  case 'success':
    console.log(`The user's name is "${result.value.name}"`)
    break
  case 'failure':
    console.log(`Failed to parse the user: ${result.error}`)
    break
}
```

> [!TIP]
> For a full reference, see the [API documentation on parsers](/api/parser).

## Overview

PureParse exports two categories of functions related to parsing:

First, there are parsers; each [primitive value](/api/parser/primitives) has a corresponding parser, where the most useful ones are:

- [parseNull](/api/parser/primitives#parseNull)
- [parseUndefined](/api/parser/primitives#parseUndefined)
- [parseBoolean](/api/parser/primitives#parseBoolean)
- [parseNumber](/api/parser/primitives#parseNumber)
- [parseString](/api/parser/primitives#parseString)

Secondly, there is a category of higher order functions that constructs new parsers based on parameters:

- [literal](/api/parser/literal#literal)
- [union](/api/parser/union#union)
- [tuple](/api/parser/tuple#tuple)
- [object](/api/parser/object#object)
- [record](/api/parser/records#record)
- [partialRecord](/api/parser/records#partialRecord)
- [array](/api/parser/arrays#array)
- [optional](/api/parser/optional#optional)

By composing these higher order functions and primitives, you end up with a schema-like syntax that models your data:

```ts
import { object, parseString, parseNumber, optional } from 'pure-parse'

const isUsers = array(
  object({
    id: parseNumber,
    parentId: nullable(parseNumber),
    name: parseString,
    address: optional(
      object({
        country: parseString,
        city: parseString,
        streetAddress: parseString,
        zipCode: parseNumber,
      }),
    ),
  }),
)
```

## Primitives

Primitive types represent [primitive values](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), which are immutable and have no properties:

```ts
parseString('hello') // -> ParseSuccess
parseNumber(42) // -> ParseSuccess
parseBoolean(true) // -> ParseSuccess
parseNull(null) // -> ParseSuccess
parseUndefined(undefined) // -> ParseSuccess
parseBigInt(42n) // -> ParseSuccess
parseSymbol(Symbol()) // -> ParseSuccess
```

## Literals

Literals types represent single values of primitive types; for example, `true`, `false`, `42`, `"hello"`, and `null` are all types _and_ values. Use the `literal()` function to create a parser function for a literal type:

```ts
const parseRed = literal('red')
const parseOne = literal(1)
```

`literal()` also lets you define unions of literals:

```ts
const parseDirection = literal('north', 'south', 'east', 'west')
parseDirection('north') // -> ParseSuccess

const parseDigit = literal(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
parseDigit(50) // -> ParseError
```

## Unions

Unions types—or sum types—represent values that can be one of several types. Use the `union()` function to create a validation function for a union type:

```ts
const parseStringOrNumber = union(parseString, parseNumber)
parseStringOrNumber('hello') // -> ParseSuccess
parseStringOrNumber(123) // -> ParseSuccess
```

Since it is very common to create unions with `null` and `undefined`, there are two helper functions for validating optional and nullable types:

- `undefineable`—for unions with `undefined`
- `nullable`—for unions with `null`

```ts
const parseUndefineableString = undefineable(parseString)
parseOptionalString('hello') // -> ParseSuccess
parseOptionalString(undefined) // -> ParseSuccess

const parseNullableString = optional(parseString)
parseNullableString('hello') // -> ParseSuccess
parseNullableString(null) // -> ParseSuccess
```

## Tuples

Tuples are arrays of fixed length, where each element has a specific type. Use the `tuple()` function to create a parser function for a tuple type:

```ts
import { tupleGuard as tuple } from 'pure-parse'

const parseCoordinate = tuple([parseNumber, parseNumber])
parseCoordinate([42, 34]) // -> ParseSuccess

const parseTransparentColor = tuple([parseString, parseNumber])
parseTransparentColor(['#FF0000', 0.5]) // -> ParseSuccess
```

## Objects

Parse objects with the `object()` function which takes an object with keys and corresponding validation functions:

```ts
const parseUser = object({
  id: parseNumber,
  name: parseString,
})
parseUser({ id: 42, name: 'Alice' }) // -> ParseSuccess
```

You can nest objects:

```ts
const parseUser = object({
  id: parseNumber,
  name: parseString,
  address: object({
    country: parseString,
    city: parseString,
    streetAddress: parseString,
    zipCode: parseNumber,
  }),
})
```

You can declare optional properties:

```ts
const parseUser = object({
  id: parseNumber,
  name: optional(parseString),
})
parseUser({ id: 42 }) // -> ParseSuccess
parseUser({ id: 42, name: undefined }) // -> ParseSuccess
parseUser({ id: 42, name: 'Jiří' }) // -> ParseSuccess
```

You can explicitly declare the type of the object and annotate the validation function with the type as a type parameter:

```ts
type User = {
  id: number
  name?: string
}
const parseUser = object<User>({
  id: parseNumber,
  name: optional(parseString),
})
```

## Arrays

Arrays are ordered set of elements of the same type. Use the `array()` function to create a validation function for an array type:

```ts
const parseBase = literal('A', 'T', 'C', 'G')
const parseDna = array(parseBase)
parseDna(['A', 'T', 'A', 'T', 'C', 'G']) // -> ParseSuccess
```

When explicitly declaring array types, provide type of the item in the array type argument:

```ts
// Validator<number[]>
const parseNumberArray = array<number>(parseNumber)
```

## Tagged/Discriminated Unions

Parse discriminated unions with unions of objects with a common tag property:

```ts
const parseState = union(
  object({
    tag: literal('loading'),
  }),
  object({
    tag: literal('error'),
    error: parseString,
  }),
  object({
    tag: literal('loaded'),
    message: parseString,
  }),
)
parseState({ tag: 'loading' }) // -> ParseSuccess
parseState({ tag: 'error', error: 'Failed to load' }) // -> ParseSuccess
parseState({ tag: 'loaded', message: 'Data loaded' }) // -> ParseSuccess
```
