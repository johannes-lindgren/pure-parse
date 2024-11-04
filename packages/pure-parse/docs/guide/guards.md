# Guards

Guards are functions that accepts one `unknown` argument and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates):

```ts
type Guard<T> = (data) => data is T
```

If the function returns `true`, TypeScript will narrow the type of the `data` argument to `T`; for example:

```ts
import { isString, isNumber, objectGuard as object } from 'pure-parse'
import data from 'my-data.json'

const isUser = object({
  name: isString,
  age: isNumber,
})

if (isUser(data)) {
  console.log(`The user's name is "${data.name}"`)
} else {
  console.error('The data does not describe a user')
}
```

> [!TIP]
> For a full reference, see the [API documentation on parsers](/api/guards).

## Overview

PureParse exports two categories of functions related to type guarding.

First, there are type guards. Each primitive value and reference type has a corresponding parser, where the most useful ones are:

- [isNull](/api/guards/primitives#isNull)
- [isUndefined](/api/guards/primitives#isUndefined)
- [isBoolean](/api/guards/primitives#isBoolean)
- [isNumber](/api/guards/primitives#isNumber)
- [isString](/api/guards/primitives#isString)
- [isObject](/api/guards/primitives#isObject)
- [isArray](/api/guards/primitives#isArray)
- [isFunction](/api/guards/primitives#isFunction)

Secondly, there is a category of higher order functions that constructs new guards based on parameters:

- [literalGuard](/api/guards/literal#literalGuard)
- [oneOfGuard](/api/guards/oneOf#oneOfGuard)
- [tupleGuard](/api/guards/tuples#tupleGuard)
- [objectGuard](/api/guards/object#objectGuard)
- [recordGuard](/api/guards/records#recordGuard)
- [partialRecordGuard](/api/guards/records#partialRecordGuard)
- [arrayGuard](/api/guards/arrays#arrayGuard)
- [nonEmptyArrayGuard](/api/guards/arrays#nonEmptyArrayGuard)
- [optionalGuard](/api/guards/optional#optionalGuard)–for optional properties. This function is special; only Guard functions constructed with `optional` can describe optional properties.

By composing these higher order functions and primitives, you end up with a schema-like syntax that models your data:

```ts
import {
  isNumber,
  isString,
  objectGuard as object,
  optionalGuard as optional,
} from 'pure-parse'

const isUsers = arrays(
  object({
    id: isNumber,
    parentId: nullable(isNumber),
    name: isString,
    address: optional(
      object({
        country: isString,
        city: isString,
        streetAddress: isString,
        zipCode: isNumber,
      }),
    ),
  }),
)
```

> [!TIP]
> See the [API Reference documentation](/api/guards) for a complete inventory

## Primitives

Primitive types represent [primitive values](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), which are immutable and have no properties:

```ts
isString('hello') // -> true
isNumber(42) // -> true
isBoolean(true) // -> true
isNull(null) // -> true
isUndefined(undefined) // -> true
isBigInt(42n) // -> true
isSymbol(Symbol()) // -> true
```

## Literals

Literals types represent single values of primitive types; for example, `true`, `false`, `42`, `"hello"`, and `null` are all types _and_ values. Use the `literalGuard()` function to create a guard function for a literal type:

```ts
const isRed = literalGuard('red')
const isOne = literalGuard(1)
```

`literalGuard()` also lets you define unions of literals:

```ts
const isDirection = literalGuard('north', 'south', 'east', 'west')
isDirection('north') // -> true

const isDigit = literalGuard(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
isDigit(5) // -> true
```

## Unions

Unions types—or sum types—represent values that can be one of several types. Use the `oneOfGuard()` function to create a validation function for a union type:

```ts
const isStringOrNumber = unionGuard(isString, isNumber)
isStringOrNumber('hello') // -> true
isStringOrNumber(123) // -> true
```

Since it is very common to create unions with `null` and `undefined`, there are two helper functions for validating optional and nullable types:

- `undefineableGuard`—for unions with `undefined`
- `nullableGuard`—for unions with `null`

```ts
const isUndefineableString = undefineableGuard(isString)
isOptionalString('hello') // -> true
isOptionalString(undefined) // -> true

const isNullableString = optionalGuard(isString)
isNullableString('hello') // -> true
isNullableString(null) // -> true
```

## Tuples

Tuples are arrays of fixed length, where each element has a specific type. Use the `tupleGuard()` function to create a guard function for a tuple type:

```ts
const isCoordinate = tupleGuard([isNumber, isNumber])
isCoordinate([42, 34]) // -> true

const isTransparentColor = tupleGuard([isString, isNumber])
isTransparentColor(['#FF0000', 0.5]) // -> true
```

## Objects

Validate objects with the `objectGuard()` function which takes an object with keys and corresponding validation functions:

```ts
const isUser = objectGuard({
  id: isNumber,
  name: isString,
})
isUser({ id: 42, name: 'Alice' }) // -> true
```

You can nest objects:

```ts
const isUser = objectGuard({
  id: isNumber,
  name: isString,
  address: objectGuard({
    country: isString,
    city: isString,
    streetAddress: isString,
    zipCode: isNumber,
  }),
})
```

You can declare optional properties:

```ts
const isUser = objectGuard({
  id: isNumber,
  name: optionalGuard(isString),
})
isUser({ id: 42 }) // -> true
isUser({ id: 42, name: undefined }) // -> true
isUser({ id: 42, name: 'Jiří' }) // -> true
```

You can explicitly declare the type of the object and annotate the validation function with the type as a type parameter:

```ts
type User = {
  id: number
  name?: string
}
const isUser = objectGuard<User>({
  id: isNumber,
  name: optionalGuard(isString),
})
```

## Arrays

Arrays are ordered sets of elements of the same type. Use the `arrayGuard()` function to create a validation function for an arrays type:

```ts
const isBase = literalGuard('A', 'T', 'C', 'G')
const isDna = arrayGuard(isBase)
isDna(['A', 'T', 'A', 'T', 'C', 'G']) // -> true
```

When explicitly declaring arrays types, provide type of the item in the arrays type argument:

```ts
// Guard<number[]>
const isNumberArray = arrayGuard<number>(isNumber)
```

## Tagged/Discriminated Unions

Validate discriminated unions with unions of objects with a common tag property:

```ts
const isState = unionGuard(
  objectGuard({
    tag: literalGuard('loading'),
  }),
  objectGuard({
    tag: literalGuard('error'),
    error: isString,
  }),
  objectGuard({
    tag: literalGuard('loaded'),
    message: isString,
  }),
)
isState({ tag: 'loading' }) // -> true
isState({ tag: 'error', error: 'Failed to load' }) // -> true
isState({ tag: 'loaded', message: 'Data loaded' }) // -> true
```
