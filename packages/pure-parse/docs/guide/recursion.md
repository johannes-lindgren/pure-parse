# Recursion

To define a self-referential validation function, use the [lazy](../api/common/lazy.md) function. This is useful for validating recursive data structures like trees.

For example:

::: code-group

```ts [Parser]
import { lazy, type Parser, object, parseString, optional } from 'pure-parse'

type Person = {
  name: string
  father?: Person
  mother?: Person
}

const parsePerson: Parser<Person> = lazy(() =>
  object({
    name: parseString,
    father: optional(parsePerson),
    mother: optional(parsePerson),
  }),
)
```

```ts [Guard]
import {
  lazy,
  type Guard,
  objectGuard,
  parseString,
  optionalGuard,
} from 'pure-parse'

type Person = {
  name: string
  father?: Person
  mother?: Person
}

const isPerson: Guard<Person> = lazy(() =>
  objectGuard({
    name: parseString,
    father: optionalGuard(parsePerson),
    mother: optionalGuard(parsePerson),
  }),
)
```

:::

> [!NOTE]
> You must use explicit type annotations for recursive types. Type inference is not available in this case.

There are two tricks to note here:

1. The `lazy` function ensures that the code works at runtime. Without `lazy`, `parsePerson` would not be defined on the `father` and `mother` properties, leading to a runtime error.
   > TS2448: Block-scoped variable \* used before its declaration.
   ```ts
   const parsePerson: Parser<Person> = object({
     name: parseString,
     // TS2448: Block-scoped variable parsePerson used before its declaration.
     father: optional(parsePerson),
     // TS2448: Block-scoped variable parsePerson used before its declaration.
     mother: optional(parsePerson),
   })
   ```
2. The explicit type annotation is due to TypeScript's inability to infer cyclical types:
   > TS7022: \* implicitly has type any because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
   ```ts
   // TS7022 parsePerson implicitly has type any because it does not have a type annotation and is referenced directly or indirectly in its own initializer.
   const parsePerson = lazy(() =>
     object({
       name: parseString,
       father: optional(parsePerson),
       mother: optional(parsePerson),
     }),
   )
   ```
