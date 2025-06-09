# Data Types

## Primitives

Primitive types represent [primitive values](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), which are immutable and have no properties:

::: code-group

```ts [Parser]
parseString('hello') // -> ParseSuccess
parseNumber(42) // -> ParseSuccess
parseBoolean(true) // -> ParseSuccess
parseNull(null) // -> ParseSuccess
parseUndefined(undefined) // -> ParseSuccess
parseBigInt(42n) // -> ParseSuccess
parseSymbol(Symbol()) // -> ParseSuccess
```

```ts [Guard]
isString('hello') // -> true
isNumber(42) // -> true
isBoolean(true) // -> true
isNull(null) // -> true
isUndefined(undefined) // -> true
isBigInt(42n) // -> true
isSymbol(Symbol()) // -> true
```

:::

## Primitive Literals (`equals`)

Primitive literals such as `true`, `false`, `42`, `"hello"`, and `null` are all types _and_ values (depending on the context they appear in). Use the `equalsGuard()` function to create a guard function that compares the data with the strict equality operator (`===`):

::: code-group

```ts [Parser]
const parseRed = equals('red')
parseRed('red') // -> ParseSuccess<'red'>
parseRed('blue') // -> ParseError

const parseOne = equals(1)
parseOne(1) // -> ParseSuccess<1>
parseOne(2) // -> ParseError
```

```ts [Guard]
const isRed = equalsGuard('red')
isRed('red') // -> true
isRed('blue') // -> false

const isOne = equalsGuard(1)
isOne(1) // -> true
isOne(2) // -> false
```

:::

To validate a union of literals, use `oneOf`:

::: code-group

```ts [Parser]
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

```ts [Guard]
const isDirection = oneOfGuard(
  equals('north'),
  equals('south'),
  equals('east'),
  equals('west'),
)
isDirection('north') // -> true
isDirection('east') // -> true

const isDigit = oneOfGuard(
  equalsGuard(0),
  equalsGuard(1),
  equalsGuard(2),
  equalsGuard(3),
  equalsGuard(4),
  equalsGuard(5),
  equalsGuard(6),
  equalsGuard(7),
  equalsGuard(8),
  equalsGuard(9),
)
isDigit(5) // -> true
isDigit(100) // -> false
```

:::

## Unions

Unions types—or sum types—represent values that can be one of several types. Use the `oneOf()` function to create a validation function for a union type:

::: code-group

```ts
const parseStringOrNumber = oneOf(parseString, parseNumber)
parseStringOrNumber('hello') // -> ParseSuccess
parseStringOrNumber(123) // -> ParseSuccess
```

```ts [Guard]
const isStringOrNumber = unionGuard(isString, isNumber)
isStringOrNumber('hello') // -> true
isStringOrNumber(123) // -> true
```

:::

Since it is very common to create unions with `null` and `undefined`, there are two helper functions for validating optional and nullable types:

- [`undefineable`](/api/parsers/optional#undefineable)/[`undefineableGuard`](/api/parsers/optional#undefineable)—for unions with `undefined`
- [`nullable`](/api/guards/optional#nullable)/[`nullableGuard`](/api/guards/optional#nullable)—for unions with `null`

::: code-group

```ts [Parser]
const parseUndefineableString = undefineable(parseString)
parseOptionalString('hello') // -> ParseSuccess<string | undefined>
parseOptionalString(undefined) // -> ParseSuccess<string | undefined>

const parseNullableString = optional(parseString)
parseNullableString('hello') // -> ParseSuccess<string | null>
parseNullableString(null) // -> ParseSuccess<string | null>
```

```ts [Guard]
const isUndefineableString = undefineableGuard(isString)
isOptionalString('hello') // -> true
isOptionalString(undefined) // -> true

const isNullableString = optionalGuard(isString)
isNullableString('hello') // -> true
isNullableString(null) // -> true
```

:::

## Tuples

Tuples are arrays of fixed length, where each element has a specific type. Use the `tuple()` function to create a parser function for a tuple type:

::: code-group

```ts [Parser]
import { tupleGuard as tuple } from 'pure-parse'

const parseCoordinate = tuple([parseNumber, parseNumber])
parseCoordinate([42, 34]) // -> ParseSuccess

const parseTransparentColor = tuple([parseString, parseNumber])
parseTransparentColor(['#FF0000', 0.5]) // -> ParseSuccess
```

```ts [Guard]
const isCoordinate = tupleGuard([isNumber, isNumber])
isCoordinate([42, 34]) // -> true

const isTransparentColor = tupleGuard([isString, isNumber])
isTransparentColor(['#FF0000', 0.5]) // -> true
```

:::

## Objects

Validate objects with [object](/api/parsers/object#object)/[objectGuard](/api/guards/object#objectGuard) which takes an object as argument, with keys and corresponding validation functions:

::: code-group

```ts [Parser]
const parseUser = object({
  id: parseNumber,
  name: parseString,
})
parseUser({ id: 42, name: 'Alice' }) // -> ParseSuccess
```

```ts [Guard]
const isUser = objectGuard({
  id: isNumber,
  name: isString,
})
isUser({ id: 42, name: 'Alice' }) // -> true
```

:::

You can nest objects:

::: code-group

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

```ts [Guard]
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

:::

You can declare optional properties:

::: code-group

```ts [Parser]
const parseUser = object({
  id: parseNumber,
  name: optional(parseString),
})
parseUser({ id: 42 }) // -> ParseSuccess
parseUser({ id: 42, name: undefined }) // -> ParseSuccess
parseUser({ id: 42, name: 'Jiří' }) // -> ParseSuccess
```

```ts [Guard]
const isUser = objectGuard({
  id: isNumber,
  name: optionalGuard(isString),
})
isUser({ id: 42 }) // -> true
isUser({ id: 42, name: undefined }) // -> true
isUser({ id: 42, name: 'Jiří' }) // -> true
```

:::

You can explicitly declare the type of the object and annotate the validation function with the type as a type parameter:

::: code-group

```ts [Parser]
type User = {
  id: number
  name?: string
}
const parseUser = object<User>({
  id: parseNumber,
  name: optional(parseString),
})
```

```ts [Guard]
type User = {
  id: number
  name?: string
}
const isUser = objectGuard<User>({
  id: isNumber,
  name: optionalGuard(isString),
})
```

:::

## Arrays

Use [array](/api/parsers/arrays#array)/[arrayGuard](/api/guards/arrays#arrayGuard) to validate arrays:

::: code-group

```ts [Parser]
const parseBase = oneOf(equals('A'), equals('T'), equals('C'), equals('G'))
const parseDna = array(parseBase)
parseDna(['A', 'T', 'A', 'T', 'C', 'G']) // -> ParseSuccess
```

```ts [Guard]
const isBase = oneOf(
  equalsGuard('A'),
  equalsGuard('T'),
  equalsGuard('C'),
  equalsGuard('G'),
)
const isDna = arrayGuard(isBase)
isDna(['A', 'T', 'A', 'T', 'C', 'G']) // -> true
```

:::

When explicitly declaring array types, provide type of the item in the array type argument:

```ts
// Validator<number[]>
const parseNumberArray = array<number>(parseNumber)
```

## Tagged/Discriminated Unions

Validate discriminated unions by combining `oneOf` with `object`:

::: code-group

```ts [Parser]
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

```ts [Guard]
const isState = unionGuard(
  objectGuard({
    tag: equalsGuard('loading'),
  }),
  objectGuard({
    tag: equalsGuard('error'),
    error: isString,
  }),
  objectGuard({
    tag: equalsGuard('loaded'),
    message: isString,
  }),
)

isState({ tag: 'loading' }) // -> true
isState({ tag: 'error', error: 'Failed to load' }) // -> true
isState({ tag: 'loaded', message: 'Data loaded' }) // -> true
```

:::
