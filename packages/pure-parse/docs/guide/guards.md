# Guards

[//]: # 'TODO link'

Guards are functions that accepts one `unknown` argument and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates):

```ts
type Guard<T>: (data) => data is T;
```

> [!INFO]
> With a type predicate, TypeScript is able to narrow the type of argument _if the function returns `true`_.

In [PureParse](https://www.npmjs.com/package/pure-parse), each [JavaScript primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) and reference type has a corresponding type guard:

- `isNull`
- `isUndefined`
- `isBoolean`
- `isNumber`
- `isString`
- `isBigInt`
- `isSymbol`
- `isObject`
- `isArray`
- `isFunction`

There is a second category of higher order functions that construct new, custom type guards:

- `literal`—for [literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), and unions between literals; e.g. `"left"` or `"left" | "right"`.
- `union`—for [union types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types), e.g. `string | number`.
- `tuple`—for [tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types), e.g. `[number, number]`.
- `object`—for [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html), e.g. `{ id: number, name?: string }`
- `record`—for [records](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) with a finite amount of keys; e.g. `Record<'left' | 'right' | 'top' | 'bottom', number>`
- `partialRecord`—for [records](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) where not all values are defined; e.g. `Partial<Record<string, number>>`
- `array`—for [arrays](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays), e.g. `string[]`
- `nonEmptyArrays`—for arrays with at least one item; for example `[string, ...string[]]`

The third category is convenience functions for dealing with `null`, `undefined`, and optional properties:

- `optional`–for optional properties. This function is special; only validator functions constructed with `optional` can describe optional properties.
- `optionalNullable`–for optional nullable properties
- `nullable`–for unions with `null`
- `undefineable`–for unions with `undefined`. If this is used for a property on an object, the property is required–not optional–but can be set to `undefined`.

By composing these higher order functions and primitives, you end up with a schema-like syntax that models your data:

```ts
const isUsers = array(
  object({
    id: isNumber,
    parentId: nullable(isNumber),
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

## Primitives

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

## Literals

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

## Unions

Unions types—or sum types—represent values that can be one of several types. Use the `union()` function to create a validation function for a union type:

```ts
const isStringOrNumber = union(isString, isNumber)
isStringOrNumber('hello') // -> true
isStringOrNumber(123) // -> true
```

Since it's very common to create unions with `null` and `undefined`, there are two helper functions for validating optional and nullable types:

- `undefineable`—for unions with `undefined`
- `nullable`—for unions with `null`

```ts
const isUndefineableString = undefineable(isString)
isOptionalString('hello') // -> true
isOptionalString(undefined) // -> true

const isNullableString = optional(isString)
isNullableString('hello') // -> true
isNullableString(null) // -> true
```

When explicitly declaring union types, provide a tuple of the union members as type argument:

```ts
const isId = union<['string', 'number']>(isString, isNumber)
const isColor = literal<['red', 'green', 'blue']>('red', 'green', 'blue')
```

Due to a limitation of TypeScript, you can't' write `union<string | number>()` or `literal<'red' | 'green' | 'blue'>()`. Therefore, it is generally recommended to omit the type arguments for union types and let TypeScript infer them.

## Tuples

Tuples are arrays of fixed length, where each element has a specific type. Use the `tuple()` function to create a validation function for a tuple type:

```ts
import { tupleGuard as tuple } from 'pure-parse'

const isCoordinate = tuple([isNumber, isNumber])
isCoordinate([42, 34]) // -> true

const isTransparentColor = tuple([isString, isNumber])
isTransparentColor(['#FF0000', 0.5]) // -> true
```

## Objects

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
import {
  optionalGuard as optional,
  optionalNullableGuard as optionalNullable,
} from 'pure-parse'

const isUser = object({
  id: isNumber,
  name: optional(isString),
  age: optionalNullable(isString),
})
isUser({ id: 42 }) // -> true
isUser({ id: 42, name: undefined, age: undefined }) // -> true
isUser({ id: 42, age: null }) // -> true
```

Note that optional properties are different from unions with `undefined`:

```ts
import {
  optionalGuard as optional,
  optionalNullableGuard as optionalNullable,
} from 'pure-parse'

const isUser = object({
  name: optional(isString),
  age: union(isUndefined, isString),
})
isUser({ age: undefined }) // -> true: name is optional and can be omitted
isUser({}) // -> false: age is not optional and must be present
isUser({ name: undefined, age: undefined }) // -> true: TypeScript allows undefined values to be assigned to optional properties
```

You can explicitly declare the type of the object and annotate the validation function with the type as a type parameter:

```ts
type User = {
  id: number
  name?: string
}
const isUser = object<User>({
  id: isNumber,
  name: optional(isString),
})
```

## Records

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

## Partial Records

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

## Arrays

Arrays are ordered lists of elements of the same type. Use the `array()` function to create a validation function for an array type:

```ts
const isBase = literal('A', 'T', 'C', 'G')
const isDna = array(isBase)
isDna(['A', 'T', 'A', 'T', 'C', 'G']) // -> true
```

Sometimes, it's useful to know whether an array has at least one element. Use the `nonEmptyArray()` function to create a validation function for an array with at least one element:

```ts
import { nonEmptyArrayGuard as nonEmptyArray } from 'pure-parse'

const isToggleState = nonEmptyArray(literal('on', 'off', 'indeterminate'))
```

Both of these functions check every element in the array. If you already have an array of validated data, and you want to find out wether it is non-empty, you can use the `nonEmptyArray` function:

```ts
import { isNonEmptyArrayGuard as isNonEmptyArray } from 'pure-parse'

const foo = (names: string[]) => {
  if (isNonEmptyArray(names)) {
    console.log(names[0]) // -> string
  }
}
```

When explicitly declaring array types, provide type of the item in the array type argument:

```ts
// Validator<number[]>
const isNumberArray = array<number>(isNumber)
// Validator<[T, ...T[]][]>
const isNonEmptyNumberArray = nonEmptyArray<number>(isNumber)
```

## Tagged/Discriminated Unions

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

## Unknown Data

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

## Custom Validator Functions

It is trivial to extend the functionality of PureParse: all you need to do is to define your own function with a type predicate. For convenience, use the `Validator<T>` generic type. Here's a working example with generic trees:

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
