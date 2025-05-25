# Formatting

To format a `ParseResult` in a human-readable format, use [formatResult](/api/parsers/formatting#formatResult):

For errors, it includes the reason and the path where the error occurred:

```ts
const result = parseUser({ name: 123 })
console.error(formatResult(result))
// -> ParseFailure: Expected type string at $.name
```

The path is formatted with JsonPath syntax, where `$.name` refers to the `name` property of the root object. To get just the JsonPath string, please refer to [formatPath](/api/parsers/formatting#formatPath).

For success, it includes the value, which it formats with string interpolation:

```ts
const result = parseNumbers([1, 2, 3, 4])
console.log(formatResult(result))
// -> ParseSuccess: 1, 2, 3, 4
```

For objects, you may want to use `JSON.stringify` as a custom value formatter to get a more readable output:

```ts
const result = parseUser({ name: 'John Doe' })
console.log(formatResult(result, JSON.stringify))
// -> ParseSuccess: {"name":"John Doe"}
```

## Translating Failures

You can build your own logic for translating failures into a human-readable format, but PureParse does not provide a built-in way to do this.
