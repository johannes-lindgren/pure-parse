<div align="center">
  <h1 align="center"><code>pure-parse</code></h1>
  <p align="center">
    Minimalistic validation library with 100% type inference.
  </p>
</div>


<p align="center">

[![Tests](https://github.com/johannes-lindgren/pure-parse/actions/workflows/code-inspection.yml/badge.svg)](https://github.com/johannes-lindgren/pure-parse/actions/workflows/code-inspection.yml)

<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/badge/licence-MIT-green" alt="License"></a>

<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

<a href="https://twitter.com/colinhacks" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@johannes--lindgren-blue.svg" alt="Created by Johannes Lindgren"></a>

</p>

<br/>

- Lightweight—0.7 kB minified + zipped
- 100% type inference—declare your validator function and infer the type automagically
- Robust—built on top of functional programming principles
- Typed & Tested—no errors, no edge cases.
- Composable & Extendable—don't get locked in with another vendor

Are you wary of adding external dependencies to your projects? Since this project is so small, you can simply copy the source code and audit it yourself.

<br/>
<div align="center">
  <em>By <a href="https://twitter.com/colinhacks">@johannes-lindgren</a></em>
</div>

## Documentation

`pure-parse` provides the means to build _validation functions_, which is are functions that accepts one `unknown` argument and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).

```ts
export type Validator<T> = (data: unknown) => data is T
```

Each [JavaScript primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) has a corresponding validation function:

- `isNull`
- `isUndefined`
- `isBoolean`
- `isNumber`
- `isString`
- `isBigInt`
- `isSymbol`

Then there is a second category of higher order functions that construct new, custom validation functions:

- `literal`—for [literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), e.g. `"left"`.
- `union`—for [union types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types), e.g. `"left" | "right"`.
- `tuple`—for [tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types), e.g. `[number, number]`.
- `object`—for [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html), e.g. `{ id: string }`
- `record`—for [records](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type), e.g. `Record<string, number>`
- `array`—for [arrays](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays), e.g. `string[]`

By composing these higher order functions and primitives, you end up with a schema-like syntax that models your data:

```ts
const isUsers = array(
  object({
    id: isNumber,
    name: isString,
    address: optional(
      object({
        country: isString,
        city: isString,
        streetAddress: isString,
        zipCode: isNumber,
      }),
    ),
  }),
)
```

To infer the type from a validator function, use the `Infer` utility type:

```ts
type Users = Infer<typeof isUsers>
```

See more examples below.

### JSON Parsing

A typical JavaScript programs need to parse some JSON data. Therefore, this library provides the `parseJson` function:

```ts
const data = parseJson(object({ id: isNumber }))('{ "a": 1 }')
if (data instanceof Error) {
  // the parsing failed
} else {
  // data is of type `{ id: number }`.
}
```

When _successful_, the returned value is the parsed JSON data; but when _unsuccessful_, the returned value will be a
JavaScript `Error`. By returning the error as a value—rather than throwing it—the `Error` type becomes part of the function's
type signature, which forces the user of `parseJson` to handle potential errors.

Note that `parseJson` is curried; that is so that you can easily define your own json parsers and validation functions.
For example:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
const isApiResponse = object({
  users: array(isUser),
})
const parseMyRestApiResponse = parseJson(isApiResponse)

export const fetchUsers = () =>
  fetch('https://api.test.com/v1/users')
    .then((res) => res.json())
    .catch((e) => new Error('The request failed', e))
    .then(parseMyRestApiResponse)
```

## Comparison to other validation libraries

Unlike other validation libraries—such as [Zod](https://www.npmjs.com/package/zod)
or [Joi](https://www.npmjs.com/package/joi)—there is no concept of a schema; instead, users deal exclusively with validation
functions.

Unlike [Joi](https://www.npmjs.com/package/joi), `pure-parse` and [Zod](https://www.npmjs.com/package/zod) are able to infer the types of the parsed data. But Zod gives the user the means to [transform](https://zod.dev/?id=transform) the data that is being validated. So while Zod does infer the type of the _result_ data, it does not give you the type of the _input_ data. Sometimes, it is important to know the original shape of the data, for example when writing back the parsed data to the source. With `pure-parse`, this problem does not exist as the type of the input always equals the same as the output. If the user wants to transform the data, they are encouraged to pipe the parsed input data to a transformation function, for example:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
const transformUser = (user: Infer<typeof User>) => ({
  ...user,
  id: user.id.toString(),
})
const parseUser = (json: string) => {
  const user = parseJson(isUser)(json)
  if (user instanceof Error) {
    return user
  }
  return userWithStringId(user)
}
```

This library is small, which makes it easy to audit and maintain. It also means that it does not contain every feature under the sun—some of which may be desirable, but others that are not. This library focuses on providing foundational building blocks that you can compose to validate most of your data structures. If you reach for a validation function that is not in the library, you are able to easily construct it yourself (with `Validator<T>`) and seamlessly integrate it with the core functionality.

| Library                                  | Unpacked Size |
| ---------------------------------------- | ------------- |
| pure-parse                               | \> 2 kB       |
| [Zod](https://www.npmjs.com/package/zod) | 533 kB        |
| [Joi](https://www.npmjs.com/package/joi) | 531 kB        |

## Examples

### Union of literal types

```ts
// 'red' | 'green' | 'blue'
const isColor = union([literal('red'), literal('green'), literal('blue')])
```

### Objects

```ts
/* {
 *  id: number,
 *  name: string,
 *  skills: string[],
 *  parentIds: [number, number],
 *  customData: JsonValue,
 *  movieRatings: Record<string, number>,
 * }
 */
const isUser = object({
  id: isNumber,
  name: isString,
  skills: array(isString),
  parentIds: tuple([isNumber, isNumber]),
  movieRatings: record(isNumber),
})
```

### Optional and Nullable Properties

Use `optional`, `nullable`, and `optionalNullable` to model optional and nullable properties

```ts
// { id: number, name?: string }
const isUsers = array(
  object({
    id: isNumber,
    name: optional(isString),
  }),
)
```

### Discriminated unions

```ts
/*
 *   { tag: 'loading' }
 * | { tag: 'error', error: string }
 * | { tag: 'loaded', message: string }
 */
const isState = union([
  object({
    tag: literal('loading'),
  }),
  object({
    tag: literal('error'),
    error: isString,
  }),
  object({
    tag: literal('loaded'),
    message: isString,
  }),
])
```

### Unknown data

Sometimes, you may want to defer the validation of the parsed value until later. In these instances, use either of these
functions:

- `isUnknown`—always returns `true`, which means that the parsed value will be of type `unknown`.
- `isJsonValue`—validates that the parsed value is of type `JsonValue`, which is a recursive type that describes any
  JSON-serializable data.

```ts
/* {
 *  id: number,
 *  title: string,
 *  body: string,
 *  customMetaData: JsonValue,
 * }
 */
const isArticle = object({
  id: isNumber,
  title: isString,
  body: isJsonValue,
})
```

### Extending

It is trivial to extend the functionality of `pure-parse` as there is no special interface for extensions. All you need to do is to define your own `Validator` function.

Here's a working example with generic trees:

```ts
export type Leaf<T> = { tag: 'leaf'; data: T }
export type Tree<T> = {
  tag: 'tree'
  data: (Tree<T> | Leaf<T>)[]
}
export const leaf =
  <T>(validator: Validator<T>) =>
  (data: unknown): data is Leaf<T> =>
    object({
      tag: literal('leaf'),
      data: validator,
    })(data)

export const tree =
  <T>(validator: Validator<T>) =>
  (data: unknown): data is Tree<T> =>
    union([
      leaf(validator),
      object({
        tag: literal('tree'),
        data: array(union([leaf(validator), tree(validator)])),
      }),
    ])(data)
```

which will validate (and infer the of) the following data:

```ts
const myTree: Tree = {
  tag: 'tree',
  data: [
    {
      tag: 'leaf',
      data: 'package.json',
    },
    {
      tag: 'tree',
      data: [
        {
          tag: 'leaf',
          data: 'index.ts',
        },
      ],
    },
  ],
}

const isTree = tree(isString)
```
