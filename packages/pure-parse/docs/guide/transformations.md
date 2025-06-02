# Transformations

Sometimes the built-in parser primitives don't do exactly what you want; in those cases, you may want to transform the result of the parser. Here is an overview of what's available:

| Function Name                             | Use case                                    | Type Signature                                                           |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| [map](/api/parsers/Parser.md#map)         | Transform successful values                 | `(parser: Parser<A>, fn: (A) => B) => Parser<B>`                         |
| [chain](/api/parsers/Parser.md#chain)     | Chain parsers, apply multiple validations   | `(parser: Parser<A>, fn: (A) => ParseResult<B>) => Parser<B>`            |
| [recover](/api/parsers/Parser.md#recover) | Provide fallbacks, customize error messages | `(parser: Parser<A>, fn: (ParseFailure) => ParseResult<A>) => Parser<A>` |

## Mapping (`map`)

With [map](/api/parsers/Parser.md#map), you can transform the value of a successful parse result:

```ts
const parseToUpperCase = map(parseString, (str) => str.toUpperCase())

parseToUpperCase('hello') // -> ParseSuccess<'HELLO'>
parseToUpperCase(123) // -> ParseFailure
```

`map` transforms the values in successful results. It is especially useful when parsing nested structures where you don't want to bother creating a [custom parser](/api/parsers/Parser.md); for example:

```ts
const parseUser = object({
  id: parseNumber,
  // John.Doe@example.com -> john.doe@example.com
  email: map(parseString, (name) => name.toLowerCase()),
})
```

There's no need to define a lengthy `parseEmail` function!

## Chaining (`chain`)

While `map` expects the transformation to always be successful, [chain](/api/parsers/Parser.md#chain) (or its alias `flatMapSuccess`) allows you to revert to a failure.

For example, it allows you to perform additional checks:

```ts
const parsePositive = chain(parseNumber, (value) =>
  value > 0 ? success(value) : failure('Expected positive number'),
)

parsePositive(42) // -> ParseSuccess<42>
parsePositive(-1) // -> ParseFailure
```

And you can simultaneously transform the value:

```ts
const parseInverse = chain(parseNumber, (value) =>
  value !== 0
    ? // Pass on the inverse of non-zero numbers
      success(1 / value)
    : // Fail when zero
      failure('Cannot invert zero'),
)

parseInverse(2) // -> ParseSuccess<0.5>
parseInverse(0) // -> ParseFailure
```

## Recovering from Failures (`recover`)

[recover](/api/parsers/Parser.md#recover) allows you to provide a fallback value:

```ts
const parseNumber = recover(parseNumber, () => success(0))

parseNumber(1) // -> ParseSuccess<1>
parseNumber('abc') // -> ParseSuccess<0>
```

It also allows you to customize the error message:

```ts
import { recoverm, failure, formatResult } from 'pure-parse'

const parseUuid = recover(parseString, () => failure('A UUID must be a string'))

formatResult(parseUuid('123e4567-e89b-12d3-a456-426614174000')) // -> ParseSuccess: 123e4567-e89b-12d3-a456-426614174000
formatResult(parseUuid(123)) // -> ParseFailure: A UUID must be a string at $
```
