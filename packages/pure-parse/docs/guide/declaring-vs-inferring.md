# Declaring versus Inferring

PureParse allows your to both declare the type of your validation functions explicitly, and to infer the types from the validation logic:

```ts
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

versus:

```ts
import { object, parseString, parseNumber } from 'pure-parse'

// Inferring the type from the validation logic
const parseUser = object({
  name: parseString,
  age: parseNumber,
})
```

But which one should you use?

## Decoupling

Inferring types can be convenient because you do not have to repeat the structure of the type in both the type alias and the parser. However, this convenience can come at a great cost: if you ever decide to switch to another validation library, _you will lose all your types_, since they're inferred from the schema. The problem with inferrence is that it couple the type aliases to the validation library. By instead deriving the parser from

Another benefit of declaring the types explicitly is that you can derive multiple parsers and guards from a single type alias.

> [!INFO]
> This section is a work in progress...

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
  children: arrays(parseTree), // [!code error]
})
```

Yields the following error on line 3:

> TS2448: Block-scoped variable parseTree used before its declaration.

The way to work around this error is to wrap the reference in a function:

```ts:line-numbers
const parseTree = (data) =>  // [!code error]
  object({
    name: parseString,
    children: arrays(parseTree),
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
    children: arrays(parseTree),
  })(data)
```

Thus, with recursive types, there is simply no way to avoid type declaration entirely.
