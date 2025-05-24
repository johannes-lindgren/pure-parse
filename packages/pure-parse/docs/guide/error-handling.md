# Error Handling

Errors are described by the type `Failure`. If the failure originated from within a data structure, the `path` property describes the path to the error, while the `message` property describes the error that occurred. For example:

```ts
import { isFailure } from 'pure-parse/src'

const res = parseUser({ name: 123 })
if (isFailure(res)) {
  console.error(res)
}
```

Gives:

```json
{
  "tag": "failure",
  "error": "Expected type string",
  "path": [
    {
      "tag": "object",
      "key": "name"
    }
  ]
}
```

## Formatting

To format a `Failure` in a human-readable format, use [formatFailure](/api/parsers/formatting#formatFailure):

```ts
import { formatFailure } from 'pure-parse'

const result = parseUser({ name: 123 })
if (isFailure(result)) {
  console.error(formatFailure(result))
}
```

Gives:

> Expected type string at $.name

## Failsafe Parsing

A benefit of parsing data over of validating data (with guards) is that errors can be handled _gracefully_ with defaults and other fallback mechanisms.

### Defaults with Static Values

The [withDefault](/api/parsers/withDefault) function wraps a parser and provides a default value if it fails; for example, `withDefault(parseNumber, 0)` is a parser that attempts to validate numbers, and falls back to `0` if it fails.

```ts
import { parseNumber, withDefault } from 'pure-parse'

const parseNum = withDefault(parseNumber, 0)
parseNum(1) // -> ParseSuccess<number>
parseNum(null) // -> ParseSuccess<0>
```

Parsers can also be chained with [oneOf](/api/parsers/oneOf) and [/api/parsers/types#succeed]:

```ts
import { parseNumber, oneOf, success, parseBigInt } from 'pure-parse'

const parseNum = oneOf(
  parseNumber,
  parseBigInt,
  // A parser that always succeeds
  () => success(0),
)
```

In fact, `withDefault(parser, defaultValue)` is just a shorthand for `oneOf(parser, () => success(defaultValue))`.

### Parsing Unions into Non-unions

Sometimes, data consists of strange union types that should be parsed into a more narrow type; for example, a mix of numbers and stringified numbers might need to be parsed into a list of numbers:

```ts
const data = [1, '2'] // Desired result: [1, 2]
```

Use `parseNumberFromString` with `oneOf` to chain it together with `parseNumber`:

```ts
import { array, oneOf, parseNumber } from 'pure-parse'

const parseData = array(oneOf(parseNumber, parseNumberFromString))
```

If `parseNumber` fails, `oneOf` will proceed to `parseNumberFromString`.

If the data could include `null` or other non-numeric values, the parser can be extended with a fallback mechanism:

```ts
import { parseNumber, array, oneOf, success } from 'pure-parse'

const parseData = array(
  oneOf(
    parseNumber,
    parseNumberFromString,
    // Default to 0; for example, when the value is `null`, or `"two"`
    () => success(0),
  ),
)
```

`() => success(0)` is a parser that ignores all arguments and always returns `Success<0>`.

> [!TIP] > `oneOf(parser, () => defaultValue)` is effectively the same as `withDefault(parser, defaultValue)

### Graceful Error Handling in Large Documents

Consider an application with a large document with many nested properties: if there is a small error anywhere in the data, it might be preferable to ignore the error and continue processing—rather than discarding the entire document.

For example, parsing a lengthy rich text document:

```ts
import {
  parseNumber,
  parseString,
  equals,
  object,
  array,
  oneOf,
  success,
} from 'pure-parse'

type RichText =
  | {
      tag: 'string'
      value: string
    }
  | {
      tag: 'number'
      value: number
    }
  | {
      tag: 'empty'
    }

const parseStringContent = object({
  tag: equals('string'),
  value: parseString,
})

const parseNumberContent = object({
  tag: equals('number'),
  value: parseNumber,
})

const parseRichText = array(
  oneOf(parseStringContent, parseNumberContent, () =>
    success({
      tag: 'empty',
    }),
  ),
)
```

Now, if the rich text document consists of 1000 items where only a single item is faulty, the whole text document does not need to be discarded—when rendering the rich text nodes, simply skip rendering the `empty` nodes.
