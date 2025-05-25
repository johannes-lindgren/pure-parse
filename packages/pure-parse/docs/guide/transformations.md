# Transformations

Sometimes it's handy to reuse existing parser to construct new ones, where you transform the parsed value somehow:

```ts
const parseToUpperCase = map(parseString, (str) => str.toUpperCase())

parseToUpperCase('hello') // -> ParseSuccess<'HELLO'>
parseToUpperCase(123) // -> ParseFailure
```

`map` transforms the values in successful results. It is especially useful when parsing nested structures where you don't want to bother creating a [custom parser](./customizing.md); for example:

```ts
const parseUser = object({
  id: parseNumber,
  // John.Doe@example.com -> john.doe@example.com
  email: map(parseString, (name) => name.toLowerCase()),
})
```

There's no need to define a lengthy `parseEmail` function!

## Chaining (`chain`)

While `map` expects the transformation to always be successful, `chain` (or its alias `flatMapSuccess`) allows you to revert to a failure.

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
