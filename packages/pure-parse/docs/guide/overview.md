# Overview

`pure-parse` is a lightweight validation library that aims to shift the coupling direction—making type aliases the primary driver for parser structure.

The main features of this library are:

[[toc]]

- Fallbacks—fail-safe parsing of large data structures.
- Performance—parse huge structures that change rapidly over time. Use cases include CRDTs, which typically are non-type safe by themselves.
- Ergonomic—easy-to-use, declarative, and built on pure functional programming principles.

::: info
`pure-parse` decoupled your types from the validation library.
:::

## Decoupling

Modern validation libraries use TypeScript generics to infer types from schemas, which guarantees type safety. But this approach has a huge downside: the schema becomes the source of truth for the types. This means that if you migrate to another validation library, you lose all types.

```ts
import z from 'zod'

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

// `User` is coupled to Zod
type User = z.Infer<typeof userSchema> // [!code error]
```

`pure-parse` takes a different approach: it uses type aliases as the source of truth, letting you type-check the parser structure:

```ts
import { object, parseString, parseNumber } from 'pure-parse'

type User = {
  name: string
  age: number
}

// parseUser is type-checked against `User`
const parseUser = object<User>({
  name: parseString,
  age: parseNumber,
})
```

This means that if you migrate to another validation library, you can keep your types.

## Inference

You _can_ also infer the type from the parser:

```ts
import { object, parseString, parseNumber, Infer } from 'pure-parse'

// parseUser is type-checked against `User`
const parseUser = object({
  name: parseString,
  age: parseNumber,
})

type User = Infer<typeof parseUser>
```

## Performance

## Fallbacks

## Ease of use
