# Parsers

A [`Parser`](/api/parsers/Parser) is a function that accepts an `unknown` argument and returns a [`ParseResult`](/api/parsers/ParseResult):

```ts
type Parser<T> = (data) => ParseResult<T>
```

`ParseResult` is either a success with a `value`, or a Failure with details on what went wrong:

```ts
type ParseResult<T> =
  | { tag: 'success'; error?: never; value: T }
  | { tag: 'failure'; error: Failure }
```

To find out whether the parsing was successful, read the `error` property:

```ts
const result = parseUser(data)

if (result.error) {
  console.log(formatResult(result))
  return
}
console.log(`The user's name is "${result.value.name}"`)
```

...or pattern match over the `tag` property:

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

## API Reference Overview

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
- [map](/api/parsers/Parser#map)—to transform the successful result of a parser.
- [chain](/api/parsers/Parser#chain)—to compose parsers together.
- [recover](/api/parsers/Parser#recover)—to handle errors.
- [withDefault](/api/parsers/withDefault#withDefault)–to fall back to a default value if the parsing fails.
- [parserFromGuard](/api/parsers/Parser#parserFromGuard)–to construct a parser from a guard.

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
> For a full reference, see the [API documentation on parsers](/api/parsers).
