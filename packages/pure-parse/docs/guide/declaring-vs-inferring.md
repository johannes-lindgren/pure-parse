# Declaring versus Inferring

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

## Decoupling

Consider this example library code for an HTTP client which is using Zod:

```ts
import { z } from 'zod'

// Define the Zod schema
const userSchema = z.object({
  id: z.number(),
  email: z.string(),
})

// Define the inferred TypeScript type
export type User = z.infer<typeof userSchema>

// Use a custom `Result` type for error handling
import type { type Result, failure } from './result'

export function fetchUsers(): Promise<Result<User[]>> {
  return fetch('/api/users')
    .then((response) => response.json())
    .then((data) => userSchema.parse(data))
    .catch(() => failure('Failed to fetch users'))
}
```

The problem is that the type `User` contains a lot of references to `Zod`, which means that if you ever decide to switch to another validation library, **you will lose all your types**!

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

// Use a custom `Result` type for error handling
import { type Result, failure } from './result'

export function fetchUsers(): Promise<Result<User[]>> {
  return fetch('/api/users')
    .then((response) => response.json())
    .then(parseUser)
    .catch(() => failure('Failed to fetch users'))
}
```

Inferring types can thus be convenient because you do not have to repeat the structure of the type in both the type alias and the parser. However, this convenience can come at a great cost: if you ever decide to switch to another validation library, _you will lose all your types_. The problem with inferrence is that it couples the type aliases to the validation library.

This is especially a problem in library code that may use a validation internally, but does not want to expose the validation library code via a its own API. For example, consider an HTTP client library that exposes a function `fetchUsers`:

### Multiple Validation Functions for the Same Type

Another benefit of declaring the types explicitly is that you can derive multiple parsers and guards from a single type alias:

```ts
import {
  object,
  parseString,
  parseNumber,
  objectGuard,
  isString,
  isNumber,
} from 'pure-parse'

type User = {
  name: string
  age: number
}

const parseUser = object<User>({
  name: parseString,
  age: parseNumber,
})

const isUser = objectGuard<User>({
  name: isString,
  age: isNumber,
})

// Etc. etc.
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

Even though `User['email']` is nullable, the `email` property on `parseUser` will only succeed if the value is a string—all `null` values will be rejected. This is because `string` is a subtype of `string | null`, meaning that any value of type `string` is also assignable to `string | null`. While this behavior might seem impractical, it is mathematically sound.

It might seem like the parser should detect the discrepancy when annotated, but inference would not have fared any better: in that case, the type of `User['email']` would have been inferred as `string`, and the parser would still reject `null` values:

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
