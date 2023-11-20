# `@johannes-lindgren/json`

A minimalistic JSON validation library with 100% type inference.

- lightweight—less than 1 kB compressed.
- well-tested—more than 100 tests.
- Strongly typed—you won't find any `any` in this library. Even internally, this library does not take any shortcuts.
- Robust—no function in this library will ever throw an error, no arguments are mutated, no state is kept.
- Tested—every function is thoroughly tested.

## Documentation

This library provides the means to build validation functions. A validation function takes one argument of `unknown` type and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).

```ts
export type Validator<T> = (data: unknown) => data is T
```

There are a few built-in validation functions—one for each [JavaScript primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive):

- `isNull`
- `isUndefined`
- `isBoolean`
- `isNumber`
- `isString`
- `isBigInt`
- `isBigSymbol`

The other structures in this library provides the mean to build custom validation functions. These functions are curried functions where the first argument is a configuration object and the second argument is a piece of data of `unknown` type.

- `literal`—for [literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).
- `union`—for [union types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types).
- `tuple`—for [tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types).
- `object`—for [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html).
- `record`—for [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type).
- `array`—for [arrays](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays).

By composing these higher order functions, you can model most of what programmers typically deal with. Of course, if you have in mind a particular data structure that this library does not support out-of-the-box—for example, trees—you're free to define your own `Validator` function, which will interoperate with the standard library.

See examples in the next section.

### JSON Parsing

JavaScript programs need to validate some JSON data. Therefore, this library provides the function for parsing JSON data with `parseJson`:

```ts
import { parseJson, isJsonValue } from "@johannes-lindgren/json";

const data = parseJson(object({ id: isNumber }))('{ "a": 1 }')
if (data instanceof Error) {
  // the parsing failed
} else {
  // data is of type `{ id: number }`.
}
```

If successful, the returned value will be the parsed JSON data; but if unsuccessful, the returned value will be a JavaScript `Error`. By returning the error as a value—rather than throwing it—the error becomes part of the function's type signature. This forces the user of `parseJson` to handle all potential errors. 

Note that `parseJson` is curried; that is so that you can easily define your own json parsers and validation functions. For example:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
const isApiResponse = object({
  users: array(isUser),
})
const parseMyRestApiResponse = parseJson(isApiResponse)

export const fetchUsers = () => fetch('/path/to/my/endpoint')
  .then(res => res.json())
  .then(parseMyRestApiResponse)
```

Sometimes, you may want to defer the validation of the parsed value until later. In these instances, use

- `isUnknown`—always returns `true`, which means that the parsed value will be of type `unknown`.
- `isJsonValue`—validates that the parsed value is of type `JsonValue`, which is a recursive type that describes any JSON-serializable data.

## Examples

### `literal`
### `union`
### `tuple`
### `object`
### `record`
### `array`