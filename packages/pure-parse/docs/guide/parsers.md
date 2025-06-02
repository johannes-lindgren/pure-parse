# Parsers

Parsers are functions that accepts an `unknown` argument and returns a discriminated union, which is either a success or a failure:

```ts
type Parser<T> = (data) => ParseResult<T>
```

where `ParseResult` is a discriminated union:

```ts
type ParseResult<T> =
  | { tag: 'success'; value: T; error?: never }
  | { tag: 'failure'; error: string }
```

To find out whether the parsing was successful, read the `error` or `tag` properties of the result; for example:

...using the `error` property:

```ts
const result = parseUser(data)

if (result.error) {
  console.log(formatResult(result))
  return
}
console.log(`The user's name is "${result.value.name}"`)
```

...or using the `tag` property:

```ts
const result = parseUser(data)

switch (result.tag) {
  case 'failure':
    console.log(formatResult(result))
    break
  case 'success':
    console.log(`The user's name is "${result.value.name}"`)
    break
}
```

> [!TIP]
> For a full reference, see the [API documentation on parsers](/api/parsers).

## Overview

PureParse exports two categories of functions related to parsing:

First, there are parsers; each [primitive value](/api/parsers/primitives) has a corresponding parser, where the most useful ones are:

- [parseNull](/api/parsers/primitives#parseNull)
- [parseUndefined](/api/parsers/primitives#parseUndefined)
- [parseBoolean](/api/parsers/primitives#parseBoolean)
- [parseNumber](/api/parsers/primitives#parseNumber)
- [parseString](/api/parsers/primitives#parseString)

Secondly, there is a category of higher order functions that constructs new parsers based on parameters:

- [equals](/api/parsers/equals#equals)
- [oneOf](/api/parsers/oneOf) (for unions and graceful error handling)
- [tuple](/api/parsers/tuples#tuple)
- [object](/api/parsers/object#object)
- [dictionary](/api/parsers/dictionary#dictionary)
- [array](/api/parsers/arrays#array)
- [optional](/api/parsers/optional#optional)

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

> [!TIP]
> See the [API Reference documentation](/api/parsers) for a complete inventory.

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

## Equality Checks for Primitive Literals

Primitive literals such as `true`, `false`, `42`, `"hello"`, and `null` are all types _and_ values (depending on the context they appear in). Use the `equalsGuard()` function to create a guard function that compares the data with the strict equality operator (`===`):

```ts
const parseRed = equals('red')
parseRed('red') // -> ParseSuccess<'red'>
parseRed('blue') // -> ParseError

const parseOne = equals(1)
parseOne(1) // -> ParseSuccess<1>
parseOne(2) // -> ParseError
```

To validate a union of literals, use `oneOf`:

```ts
const parseDirection = oneOf(
  equals('north'),
  equals('south'),
  equals('east'),
  equals('west'),
)
parseDirection('north') // -> ParseSuccess<'north' | 'south' | 'east' | 'west'>
parseDirection('up') // -> ParseError

const parseDigit = oneOf(
  equals(0),
  equals(1),
  equals(2),
  equals(3),
  equals(4),
  equals(5),
  equals(6),
  equals(7),
  equals(8),
  equals(9),
)
parseDigit(5) // -> ParseSuccess<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>
parseDigit(50) // -> ParseError
```

## Unions

Unions types—or sum types—represent values that can be one of several types. Use the `oneOf()` function to create a validation function for a union type:

```ts
const parseStringOrNumber = oneOf(parseString, parseNumber)
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

Arrays are ordered set of elements of the same type. Use the `array()` function to create a validation function for an arrays type:

```ts
const parseBase = oneOf(equals('A'), equals('T'), equals('C'), equals('G'))
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
const parseState = oneOf(
  object({
    tag: equals('loading'),
  }),
  object({
    tag: equals('error'),
    error: parseString,
  }),
  object({
    tag: equals('loaded'),
    message: parseString,
  }),
)
parseState({ tag: 'loading' }) // -> ParseSuccess
parseState({ tag: 'error', error: 'Failed to load' }) // -> ParseSuccess
parseState({ tag: 'loaded', message: 'Data loaded' }) // -> ParseSuccess
```
