# Failsafe Parsing

A benefit of parsing data over of validating data (with guards) is that errors can be handled gracefully with defaults and other fallback mechanisms.

### Defaults with Static Values

The [always](/api/parsers/always) function returns a parser that always succeeds; for example, `always(0)` returns a parser that always returns `Success<0>`.

To fall back to a static value, chain together a parser of your liking and `always` with [oneOf](/api/parsers/oneOf); for example, parsing a number and falling back to `0` when parsing fails:

```ts
import { oneOf, parseNumber, always } from 'pure-parse'

const parseNum = oneOf(parseNumber, always(0))
```

### Parsing Unions into Non-unions

Sometimes, data consists of strange union types that should be parsed into a more narrow type; for example, parsing a mix of numbers and stringified numbers:

```ts
const data = [1, '2']
```

into:

```ts
const data = [1, 2]
```

Write a custom parser `parseNumberFromString` that parses stringified numbers into `number`, and use `oneOf` to chain it together with `parseNumber`:

```ts
import { array, oneOf, parseNumber } from 'pure-parse'

const parseData = array(oneOf(parseNumber, parseNumberFromString))
```

To ensure that the result is always a `number`, simply append `always` at the end:

```ts
import { oneOf, parseNumber } from 'pure-parse'

const parseData = array(
  oneOf(
    parseNumber,
    parseNumberFromString,
    // Default to 0; for example, when the value is `null`, or `"two"`
    always(0),
  ),
)
```

### Graceful Error Handling

Consider an application with a large document with many nested properties: if there is a small error anywhere in the data, it might be preferable to ignore the error and continue processing—rather than discarding the entire document.

For example, parsing a lengthy rich text document:

```ts
import {
  parseNumber,
  parseString,
  literal,
  object,
  array,
  always,
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
  tag: literal('string'),
  value: parseString,
})

const parseNumberContent = object({
  tag: literal('number'),
  value: parseNumber,
})

const parseRichText = array(
  parseStringContent,
  parseNumberContent,
  always({
    tag: 'empty',
  }),
)
```

Now, if the rich text document consists of 1000 items where only a single item is faulty, the whole text document does not need to be discarded—when rendering the rich text nodes, simply skip rendering the `empty` nodes.
