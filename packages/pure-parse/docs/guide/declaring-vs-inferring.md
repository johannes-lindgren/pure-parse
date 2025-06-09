# Declaring vs. Inferring

PureParse allows your to both declare the type of your validation functions explicitly, and to infer the types from the validation logic:

::: code-group

```ts [Parser]
import { object, parseString, parseNumber } from 'pure-parse'

type User = {
  name: string
  age: number
}

// Declaring the type explicitly
const parseUser = object<User>({
  name: parseString,
  age: parseNumber,
})
```

```ts [Guard]
import { objectGuard, isString, isNumber } from 'pure-parse'

type User = {
  name: string
  age: number
}

// Declaring the type explicitly
const isUser = objectGuard<User>({
  name: isString,
  age: isNumber,
})
```

:::

versus:

::: code-group

```ts [Parser]
import { object, parseString, parseNumber } from 'pure-parse'

// Inferring the type from the validation logic
const parseUser = object({
  name: parseString,
  age: parseNumber,
})
```

```ts [Guard]
import { objectGuard, isString, isNumber } from 'pure-parse'

// Inferring the type from the validation logic
const isUser = objectGuard({
  name: isString,
  age: isNumber,
})
```

:::

But which one should you use?

## Types as the Source of Truth

When _inferring_ types from the validation code, the types become _dependent_ on the _validation library_.

This means that if you ever decide to switch to another validation library, you will **lose all your types**!

With PureParse, you can define the type explicitly, decoupling it from the validation library:

```ts
import { object, parseNumber, parseString } from 'pure-parse'

type User = {
  id: number
  email: string
}

const parseUser = object<User>({
  id: parseNumber,
  email: parseString,
})
```

Now, you can replace `parseUser` and remove PureParse as a dependency whenever you want without touching `User`.

## Hiding Dependency in Library Code

In library code, when inferring types from validation logic, the types include references to the validation library.

For example, the library code below that has some _internal_ runtime validation with Zod (`userSchema`), but it only exports the type alias `User`:

```ts
import { z } from 'zod'

// Internal usage only
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
})

// This is the public API of the library
export type User = z.infer<typeof userSchema>
```

The problem is that the type `User` includes references to `Zod`—when hovering `User` in an IDE, you will see the following information which includes references to Zod:

> ```ts
> export type User = z.infer<typeof userSchema>
> ```
>
> ---
>
> Initial type:
>
> ```ts
> {id: ZodNumber["_output"], name: ZodString["_output"]}
> ```

This means that Zod's types has leaked and become part of the public API of the library.

For library code, it's better to declare the types explicitly and type-check the validation logic:

```ts
import { object, parseNumber, parseString } from 'pure-parse'

// This is the public API of the library
export type User = {
  id: number
  name: string
}

// Internal usage only
const parseUser = object<User>({
  id: parseNumber,
  name: parseString,
})
```

## Validating External Types

If you want to validate data that is typed by an external library, you simply lack the option to define those types from your own validation logic:

```ts
import { object, parseString, parseNumber } from 'pure-parse'

// 1. Importing an external type
import { MyType } from 'external-library'

// 2. Validating external types
const parseMyType = object<MyType>({
  name: parseString,
  age: parseNumber,
})
```

## Multiple Validation Functions for the Same Type

You can derive multiple parsers and guards from a single type alias:

```ts
import {
  object,
  parseString,
  parseNumber,
  chain,
  failure,
  success,
} from 'pure-parse'

type User = {
  name: string
  age: number
}

const parseUserLoose = object<User>({
  name: parseString,
  age: parseNumber,
})

const parseUserStrict = object<User>({
  name: parseString,
  age: chain(parseNumber, (age) =>
    age > 0 ? success(age) : failure('Expected age to be positive'),
  ),
})
```

When inferring the type, there is no way to define multiple parsers/guards and guarantee that they describe the same type.

## Subtyping

Consider the following example:

```ts
import { object, parseString, parseNumber } from 'pure-parse'

type User = {
  id: string
  email: string | null
}

const parseUser = object<User>({
  name: parseString,
  email: parseString,
})
```

Even though `User['email']` is nullable, the `email` property on `parseUser` will only succeed if the value is a string—all `null` values will be rejected. This is because `string` is a subtype of `string | null`, meaning that any value of type `string` is also assignable to `string | null`. While this behavior might seem impractical, it is mathematically sound, and in some instances desirable.

Note that it might seem like the parser should detect the discrepancy when annotated, but inference would not have fared any better: in that case, the type of `User['email']` would have been inferred as `string`, and the parser would still reject `null` values:

```ts
import { object, parseString, parseNumber, Infer } from 'pure-parse'

const parseUser = object({
  name: parseString,
  email: parseString,
})

// The inferred type of `User` is `{ name: string, email: string }`
type User = Infer<typeof parseUser>
```

## Recursive Types

Due to a limitation of TypeScript, not all types _can_ be inferred; in particular, recursive types are not inferrable.

For example, attempt to define a tree parser:

```ts:line-numbers
const parseTree = object({
  name: parseString,
  children: array(parseTree), // [!code error]
})
```

Yields the following error on line 3:

> TS2448: Block-scoped variable parseTree used before its declaration.

The way to work around this error is to wrap the reference in a function:

```ts:line-numbers
const parseTree = (data) =>  // [!code error]
  object({
    name: parseString,
    children: array(parseTree),
  })(data)
```

But that gives the following errors on line 1:

TS7023: parseTree implicitly has return type any because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.

TS7006: Parameter data implicitly has an any type.

The way to finally address it is to declare the type explicitly:

```ts:line-numbers
type Tree = {
  name: string
  children: Tree[]
}

const parseTree: Parser<Tree> = (data) =>
  object({
    name: parseString,
    children: array(parseTree),
  })(data)
```

Thus, with recursive types, there is simply no way to avoid type declaration entirely.
