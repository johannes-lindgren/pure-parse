# Guards

[//]: # 'TODO link'

Guards are functions that accepts one `unknown` argument and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates):

```ts
type Guard<T>: (data) => data is T;
```

::: note
With a type predicate, TypeScript is able to narrow the type of argument _if the function returns `true`_.
:::

In [pure-parse](https://www.npmjs.com/package/pure-parse), each [JavaScript primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) and reference type has a corresponding type guard:

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
