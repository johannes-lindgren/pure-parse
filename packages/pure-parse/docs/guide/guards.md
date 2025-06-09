# Guards

A [`Guard`](/api/guards/Guard) are functions that accepts one `unknown` argument and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates):

```ts
type Guard<T> = (data) => data is T
```

If the function returns `true`, TypeScript will narrow the type of the `data` argument to `T`; for example:

```ts
import { isString, isNumber, objectGuard as object } from 'pure-parse'
import data from 'my-data.json'

const isUser = object({
  name: isString,
  age: isNumber,
})

if (isUser(data)) {
  console.log(`The user's name is "${data.name}"`)
} else {
  console.error('The data does not describe a user')
}
```

## API Reference Overview

PureParse exports two categories of functions related to type guarding.

First, there are type guards. Each primitive value and reference type has a corresponding parser, where the most useful ones are:

- [isNull](/api/guards/primitives#isNull)
- [isUndefined](/api/guards/primitives#isUndefined)
- [isBoolean](/api/guards/primitives#isBoolean)
- [isNumber](/api/guards/primitives#isNumber)
- [isString](/api/guards/primitives#isString)
- [isObject](/api/guards/primitives#isObject)
- [isArray](/api/guards/primitives#isArray)
- [isFunction](/api/guards/primitives#isFunction)

Secondly, there is a category of higher order functions that constructs new guards based on parameters:

- [equalsGuard](/api/guards/equals#equalsGuard)
- [oneOfGuard](/api/guards/oneOf#oneOfGuard)
- [tupleGuard](/api/guards/tuples#tupleGuard)
- [objectGuard](/api/guards/object#objectGuard)
- [dictionaryGuard](/api/guards/dictionary#dictionaryGuard)
- [arrayGuard](/api/guards/arrays#arrayGuard)
- [nonEmptyArrayGuard](/api/guards/arrays#nonEmptyArrayGuard)
- [optionalGuard](/api/guards/optional#optionalGuard)–for optional properties. This function is special; only Guard functions constructed with `optional` can describe optional properties.

By composing these higher order functions and primitives, you end up with a schema-like syntax that models your data:

```ts
import {
  isNumber,
  isString,
  objectGuard as object,
  optionalGuard as optional,
} from 'pure-parse'

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

> [!TIP]
> For a full reference, see the [API documentation on parsers](/api/guards).
