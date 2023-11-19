# `@johannes-lindgren/json`

A minimalistic JSON validation library with 100% type inference.

- lightweight — less than 1 kB compressed
- Strongly typed — you won't find any `any`.
- Purely Functional - no error thrown, no arguments are mutated, no state is kept.
- tested — every function is thoroughly tested

## Documentation

Parse your JSON strings with `parseJson`: 

```ts
import { parseJson } from "@johannes-lindgren/ts-is";

const data = parseJson()('{ "a": 1 }')
if (data instanceof Error) {
  // the parsing failed
} else {
  // data is of type `JsonValue`, which you can perform pattern matching on
}
```

Note that `parseJson` is a curried function; that is because you usually will want to pass a validator function

to also validate the data, pass a validator function

```ts
import { parseJson, isNumber } from "@johannes-lindgren/ts-is";

const data = parseJson(isNumber)('123')
if (data instanceof Error) {
  // the parsing or the validation failed
} else {
  // data is of type `number`
}
```