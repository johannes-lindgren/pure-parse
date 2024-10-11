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
