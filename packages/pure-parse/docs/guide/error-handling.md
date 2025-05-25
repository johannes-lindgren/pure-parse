# Error Handling

A core strength of Pure Parse is its ability to recover from errors gracefully, allowing you to parse large data structures without discarding the entire document when a small error occurs deep in the structure.

## Defaults with Static Fallback Values (`withDefault`)

The easiest way to recover from failures is with a static value. The [withDefault](/api/parsers/withDefault) function wraps a parser and provides a default value if it fails.

For example, `withDefault(parseNumber, 0)` is a parser that attempts to validate the data as a number, but falls back to `0` when that fails:

```ts
import { parseNumber, withDefault } from 'pure-parse'

const parseNum = withDefault(parseNumber, 0)
parseNum(1) // -> ParseSuccess<number>
parseNum(null) // -> ParseSuccess<0>
parseNum('abc') // -> ParseSuccess<0>
```

## Parsing With Multiple-attempts (`oneOf`)

Sometimes, data consists of strange union types that should be parsed into a more narrow type; for example, a mix of numbers and stringified numbers might need to be parsed into a list of numbers:

```ts
const data = [1, '2'] // Desired result: [1, 2]
```

[oneOf](/api/parsers/oneOf) lets you pass multiple parsers and retry each until one of them succeeds (or all of them fails). With the example above, chain together `parseNumberFromString` and `parseNumber` using `oneOf`:

```ts
import { array, oneOf, parseNumber } from 'pure-parse'

const parseData = array(oneOf(parseNumber, parseNumberFromString))
```

If `parseNumber` fails, `oneOf` will proceed to `parseNumberFromString`.

To fall back to a static value, you can use `withDefault`—or use a custom parser:

```ts
import { array, oneOf, success } from 'pure-parse'

const parseData = array(
  oneOf(
    parseNumber,
    parseNumberFromString,
    // Default to 0; for example, when the value is `null`, or `"two"`
    () => success(0),
  ),
)
```

`() => success(0)` is a parser which simply ignores the input and always succeeds with the value `0`.

> [!TIP] > `oneOf(parser, () => defaultValue)` is effectively the same as `withDefault(parser, defaultValue)

## Dynamic Fallback Values (`oneOf`)

Sometimes, the fallback value needs to be calculated _dynamically_.

For example, consider a UI application where you display a list of TODO items:

```ts
type Todo = {
  uid: string
  text: string
}
const parseTodo = object<Todo>({
  uid: parseString,
  text: parseString,
})
const parseTodos = array(parseTodo)
```

```tsx
<ul>
  {todos.map((todo) => (
    <li key={todo.uid}>{todo.text}</li>
  ))}
</ul>
```

Some of the TODO items have been written in an incompatible format and thus cannot be parsed, in which case we want to fall back to a default text `"Untitled"`—but what should the `uid` be?

We can't fall back to a static value, because the `uid` needs to be unique.

```ts
// ❌ Don't:
const parseTodos = array(
  withDefault(parseTodo, {
    // Non-unique value!
    uid: '',
    text: 'Unknown TODO',
  }),
)
```

The keys needs to be stable, but if we are not going to re-evaluate the parser, we can generate them randomly:

```ts
import { v4 as uuidv4 } from 'uuid'
import { array, oneOf, success } from 'pure-parse'

const parseTodos = array(
  oneOf(parseTodo, () =>
    success({
      // Generate a unique ID
      uid: uuidv4(),
      text: 'Untitled',
    }),
  ),
)
```

We can also try to parse the `uid` from the data, ignoring all the rest:

```ts
const parseWithUid = object({
  uid: parseString,
})
const parseTodos = array<Todo>(
  oneOf(
    parseTodo,
    // If the `uid` can be parsed, construct a new `Todo`
    map(parseWithUid, (it) => ({
      ...it,
      title: 'Untitled',
    })),
  ),
)
const res = parseTodos([
  { uid: '1', title: 'Todo 1' },
  { uid: '2', title: 123 },
  { uid: '3' },
])
/*
  [
    { uid: '1', title: 'Todo 1' },
    { uid: '2', title: 'Untitled' },
    { uid: '3', title: 'Untitled' },
  ]
 */
```

See [Transformations](./transformations.md)

## Example: Graceful Error Handling in Large Documents

Consider an application with a large document with many nested properties: if there is a small error anywhere in the data, it might be preferable to ignore the error and continue processing—rather than discarding the entire document.

For example, when parsing a lengthy rich text document, fall back to an `empty` node when a node cannot be parsed, rather than failing the entire document:

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

Now, if the rich text document consists of 1000 items where only a single item is faulty, the whole text document does not need to be discarded—when rendering the rich text nodes—simply skip rendering the `empty` nodes.
