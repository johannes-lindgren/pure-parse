<div align="center">
  <h1 align="center"><code>pure-parse</code></h1>
  <p align="center">
    Minimalistic, schema-free validation library with type inference and explicit type declarations.
  </p>
</div>

<p align="center">
<a href="https://github.com/johannes-lindgren/pure-parse/actions?query=branch%3Amain"><img src="https://github.com/johannes-lindgren/pure-parse/actions/workflows/test.yml/badge.svg?event=push&branch=main" alt="CI Status for Tests" /></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/badge/licence-MIT-green" alt="License"></a>
<a href="https://github.com/johannes-lindgren" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@johannes--lindgren-blue.svg" alt="Created by Johannes Lindgren"></a>
</p>

<br/>

Why does the world need yet another validation library? Because this library lets you choose whether to declare your types explicitly or having them inferred.

**Infer types**:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
type User = Infer<typeof isUser>
```

**Declare types explicitly**:

```ts
type User = {
  id: number
  name: string
}
const isUser = object<User>({
  id: isNumber,
  name: isString,
})
```

Furthermore, this library is designed to be:

- Lightweight—0.7 kB minified + zipped
- Robust—built on top of functional programming principles, while having thorough tests for both the executable code and the type system.
- Composable & Extendable—easily extend the library with your own validation functions.
- No vendor lock-in—this library uses plain TypeScript and JavaScript languages features and does not introduce any library-specific constructs.

Are you wary of adding external dependencies to your projects? Since this project is so small, you can simply copy the source code and audit it yourself.

<br/>
<div align="center">
  <em>By <a href="https://github.com/johannes-lindgren">@johannes-lindgren</a></em>
</div>

## Documentation

`pure-parse` provides the means to build _validation functions_, which is are functions that accepts one `unknown` argument and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).

```ts
export type Validator<T> = (data: unknown) => data is T
```

With a type predicate, TypeScript is able to narrow the type of argument _if the function returns `true`_.

In [pure-parse](https://www.npmjs.com/package/pure-parse), each [JavaScript primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) has a corresponding validation function:

- `isNull`
- `isUndefined`
- `isBoolean`
- `isNumber`
- `isString`
- `isBigInt`
- `isSymbol`

Then there is a second category of higher order functions that construct new, custom validation functions:

- `literal`—for [literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), and unions between literals; for example, `"left"` or `"left" | "right"`.
- `union`—for [union types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types); for example, `string | number`.
- `tuple`—for [tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types); for example, `[number, number]`.
- `object`—for [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html); for example, `{ id: number, name?: string }`
- `record`—for [records](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) with a finite amount of keys; for example, `Record<'left' | 'right' | 'top' | 'bottom', number>`
- `partialRecord`—for [records](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) where not all values are defined; for example, `Partial<Record<string, number>>`
- `array`—for [arrays](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays), e.g. `string[]`
- `nonEmptyArrays`—for arrays with at least one item; for example `[string, ...string[]]`

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

See more examples below.

### Inferring and Declaring Types

To infer the type from a validator function, use the `Infer` utility type:

```ts
type Users = Infer<typeof isUsers>
```

If you'd rather declare your type explicitly, annotate the validation functions with a type parameter:

```ts
type User = {
  id: number
  name: string
  address?: {
    country: string
    city: string
    streetAddress: string
    zipCode: number
  }
}
const isUser = object<User>({
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
})
```

If the type predicate in the validation function (`isUser`) does not match the type argument (`User`), you will get a type error. This powerful feature ensures that the inferred type is in sync with the type it is validating.

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

### Primitives

Primitive types represent [primitive values](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), which are immutable and have no properties:

```ts
isString('hello') // -> true
isNumber(42) // -> true
isBoolean(true) // -> true
isNull(null) // -> true
isUndefined(undefined) // -> true
isBigInt(42n) // -> true
isSymbol(Symbol()) // -> true
```

### Literals

Literals types represent single values of primitive types; for example, `true`, `false`, `42`, `"hello"`, and `null` are all types _and_ values. Use the `literal()` function to create a validation function for a literal type:

```ts
const isRed = literal('red')
const isOne = literal(1)
```

`literal()` also lets you define unions of literals:

```ts
const isDirection = literal('north', 'south', 'east', 'west')
isDirection('north') // -> true

const isDigit = literal(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
isDigit(5) // -> true
```

### Unions

Unions types—or sum types—represent values that can be one of several types. Use the `union()` function to create a validation function for a union type:

```ts
const isStringOrNumber = union(isString, isNumber)
isStringOrNumber('hello') // -> true
isStringOrNumber(123) // -> true
```

Since it's very common to create unions with `null` and `undefined`, there are three helper functions for validating optional and nullable types:

- `optional`—for unions with `undefined`
- `nullable`—for unions with `null`
- `optionalNullable`—for unions with `undefined | null`

```ts
const isOptionalString = nullable(isString)
isOptionalString('hello') // -> true
isOptionalString(undefined) // -> true

const isNullableString = optional(isString)
isNullableString('hello') // -> true
isNullableString(null) // -> true

const isOptionalNullableString = optionalNullable(isString)
isOptionalNullableString('hello') // -> true
isOptionalNullableString(undefined) // -> true
isOptionalNullableString(null) // -> true
```

### Tuples

Tuples are arrays of fixed length, where each element has a specific type. Use the `tuple()` function to create a validation function for a tuple type:

```ts
import { tuple } from './validation'
import { isTest } from 'std-env'

const isCoordinate = tuple([isNumber, isNumber])
isCoordinate([42, 34]) // -> true

const isTransparentColor = tuple([isString, isNumber])
isTransparentColor(['#FF0000', 0.5]) // -> true
```

### Objects

Validate objects with the `object()` function. The function takes an object with keys and corresponding validation functions:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
isUser({ id: 42, name: 'Alice' }) // -> true
```

You can nest objects:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
  address: object({
    country: isString,
    city: isString,
    streetAddress: isString,
    zipCode: isNumber,
  }),
})
```

You can declare optional properties:

```ts
import { optional } from './validation'

const isUser = object({
  id: isNumber,
  name: optional(isString),
})
isUser({ id: 42 }) // -> true
```

### Records

Records are objects that map string keys to values. Call `record()` with a list of all keys and a validation function for the values:

```ts
const isPadding = record(['left', 'right', 'top', 'bottom'], isNumber)
isPadding({ left: 10, right: 20, top: 0, bottom: 0 }) // -> true
```

Note that for each key, there must exist a corresponding value, so that when you index a validated record, you are certain to retrieve a result:

```ts
if (isPadding(data)) {
  console.log(data.left + 10) // -> number
}
isPadding({ left: 10, right: 20 }) // -> false
```

### Partial Records

To validate a record where the values might not exist for every key—for example, `Record<string, ?>`—use the `partialRecord()` function:

```ts
const isWordbook = partialRecord(isString, isString)
isWordbook({
  hello: 'used to express a greeting',
  goodbye: 'farewell (a conventional expression used at parting)',
}) // -> true

const isPadding = partialRecord(
  literal('left', 'right', 'top', 'bottom'),
  isNumber,
)
isPadding({ left: 10, right: 20 }) // -> true
```

### Arrays

Arrays are ordered lists of elements of the same type. Use the `array()` function to create a validation function for an array type:

```ts
const isBase = literal('A', 'T', 'C', 'G')
const isDna = array(isBase)
isDna(['A', 'T', 'A', 'T', 'C', 'G']) // -> true
```

Sometimes, it's useful to know whether an array has at least one element. Use the `nonEmptyArray()` function to create a validation function for an array with at least one element:

```ts
import { nonEmptyArray } from './validation'

const isToggleState = nonEmptyArray(literal('on', 'off', 'indeterminate'))
```

Both of these functions check every element in the array. If you already have an array of validated data, and you want to find out wether it is non-empty, you can use the `nonEmptyArray` function:

```ts
import { isNonEmptyArray } from './validation'
;(names: string[]) => {
  if (isNonEmptyArray(names)) {
    console.log(names[0]) // -> string
  }
}
```

While JavaScript lets you do `names.length !== 0`, that would not let TypeScript understand that the array is non-empty.

### Tagged/Discriminated Unions

Validate discriminated unions with unions of objects with a common tag property:

```ts
const isState = union(
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
)
isState({ tag: 'loading' }) // -> true
isState({ tag: 'error', error: 'Failed to load' }) // -> true
isState({ tag: 'loaded', message: 'Data loaded' }) // -> true
```

### Unknown Data

Sometimes, you may want to defer the validation of the parsed value until later. In these instances, use either of these
functions:

- `isUnknown`—always returns `true`, which means that the parsed value will be of type `unknown`.
- `isJsonValue`—validates that the parsed value is of type `JsonValue`, which is a type that describes any
  JSON-serializable data.

```ts
/* {
    id: number,
    customMetaData: JsonValue,
   }
 */
const isArticle = object({
  id: isNumber,
  customMetaData: isJsonValue,
})
isArticle({
  id: 42,
  customMetaData: {
    foo: 'bar',
  },
}) // -> true
```

### Custom Validator Functions

It is trivial to extend the functionality of `pure-parse`: all you need to do is to define your own function with a type predicate. For convenience, use the `Validator<T>` generic type. Here's a working example with generic trees:

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
    union(
      leaf(validator),
      object({
        tag: literal('tree'),
        data: array(union(leaf(validator), tree(validator))),
      }),
    )(data)
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

## Comparison to other validation libraries

What sets `pure-parse` apart from other validation libraries is the freedom it gives to the user to choose between type inference and explicit type declarations.

### Type Inference _and_ Explicit Type Declarations

Unlike [Joi](https://www.npmjs.com/package/joi), [pure-parse](https://www.npmjs.com/package/pure-parse)—like [Zod](https://www.npmjs.com/package/zod)—is able to infer the type:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
type User = Infer<typeof isUser>
```

But unlike Zod, [pure-parse](https://www.npmjs.com/package/pure-parse)—like [Zod](https://www.npmjs.com/package/zod) _also_ allows you the options to declare your types explicitly:

```ts
type User = {
  id: number
  name: string
}
const isUser = object<User>({
  id: isNumber,
  name: isString,
})
```

If the validation function does not match the type, you will get a type error. Inferred types often consists of a complex expressions, which can be hard to read. By declaring the types explicitly, you can make the code more readable and maintainable. Explicit types also serve as documentation for the data structure, and a source of truth

### Schema-free and no vendor lock-in

Unlike other validation libraries—such as [Zod](https://www.npmjs.com/package/zod)
and [Joi](https://www.npmjs.com/package/joi)—[pure-parse](https://www.npmjs.com/package/pure-parse)—[pure-parse](https://www.npmjs.com/package/pure-parse) has no concept of a schema: instead, users deal exclusively with [type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates), which is a TypeScript language feature. This means that the library does introduce any library-specific constructs into your codebase, which prevents vendor lock-in.

### Lightweight

[pure-parse](https://www.npmjs.com/package/pure-parse)—like [Zod](https://www.npmjs.com/package/zod) library is tiny, which makes it easy to audit and maintain. By having a small size (and by being tree-shakable) [pure-parse](https://www.npmjs.com/package/pure-parse) ensures that the final footprint on the application bundle size is minimal.

| Library                                                | Minified + Zipped |
| ------------------------------------------------------ | ----------------- |
| [pure-parse](https://www.npmjs.com/package/pure-parse) | 0.8 kB            |
| [Zod](https://www.npmjs.com/package/zod)               | 21 kB             |
| [Yup](https://www.npmjs.com/package/yup)               | 60 kB             |
| [Joi](https://www.npmjs.com/package/joi)               | 236 kB            |

Due to the small size, by design, the library does _not_ contain every feature under the sun. This library focuses on providing foundational building blocks that you can compose to validate most of your data structures. If you reach for a validation function that is not in the library, you are able to easily construct it yourself (with `Validator<T>`) and seamlessly integrate it with the core functionality.

Note that even though other libraries might be much larger, the final contribution to the bundle size will depend on whether the library is tree-shakeable and how many features of the library your application uses.

### No built-in transformations

Zod gives the user the means to [transform](https://zod.dev/?id=transform) the data that is being validated. So while Zod does infer the type of the _result_ data, it does not infer the type of the _input_ data. Sometimes, it is important to know the original shape of the data; for example, when writing back the parsed data to the source with a Restful API. With `pure-parse`, this problem does not exist as the type of the input always equals the same as the output. If the user wants to transform the data, they are encouraged to pipe the parsed input data to a transformation function.

### Error messages

Unlike many validation libraries, [pure-parse](https://www.npmjs.com/package/pure-parse) does not give any details of why a validation did not fail. The return type of a validation is always a type predicate

## Exceptions to explicit type annotation

Generally, the functions are annotated with the same type that they are validating for; for example:

```ts
isObject<{ id: number }>({ id: isNumber })
```

However, there are some exceptions to this rule due to some limitations of TypeScript.

### Union types

When explicitly declaring union types, provide a tuple of the union members as type argument:

```ts
const isId = union<['string', 'number']>(isString, isNumber)
const isColor = literal<['red', 'green', 'blue']>('red', 'green', 'blue')
```

Due to a limitation of TypeScript, you can't' write `union<string | number>()` or `literal<'red' | 'green' | 'blue'>()`. Therefore, it is generally recommended to omit the type arguments for union types and let TypeScript infer them.

### Arrays

When explicitly declaring array types, provide type of the item in the array type argument:

```ts
// Validator<number[]>
const isNumberArray = array<number>(isNumber)
// Validator<[T, ...T[]][]>
const isNonEmptyNumberArray = nonEmptyArray<number>(isNumber)
```
