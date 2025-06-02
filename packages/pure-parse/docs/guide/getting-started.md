# Quick Start

Install the package:

::: code-group

```sh [npm]
$ npm add pure-parse
```

```sh [pnpm]
$ pnpm add pure-parse
```

```sh [yarn]
$ yarn add pure-parse
```

```sh [yarn (pnp)]
$ yarn add pure-parse
```

```sh [bun]
$ bun add pure-parse
```

:::

Create a [parser](parsers) by composing higher-order functions with parser primitives.

::: code-group

```ts [Parser]
import { object, parseString, parseNumber } from 'pure-parse'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})
```

```ts [Guard]
import { objectGuard, isString, isNumber } from 'pure-parse'

const isUser = objectGuard({
  name: isString,
  age: isNumber,
})
```

:::

> [!TIP]
> You can create [type guards](guards) with a similar syntax: use the tabs to switch between examples for parsers and type guards.

## Declare the Type

Define a type alias to type-check the parser:

::: code-group

```ts [Parser]
import { object, parseString, parseNumber } from 'pure-parse'

type User = {
  name: string
  age: number
}

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

const isUser = objectGuard<User>({
  name: isString,
  age: isNumber,
})
```

:::

If the parser does not match the type argument (`User`), you will get a type error. This powerful feature ensures that the parsed result value always adheres to the type parameter.

## ...or Infer the Type

You can also infer the type from the parser:

::: code-group

```ts [Parser]
import { object, parseString, parseNumber, Infer } from 'pure-parse'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})

type User = Infer<typeof parseUser>
```

```ts [Guard]
import { objectGuard, isString, isNumber, Infer } from 'pure-parse'

const isUser = objectGuard({
  name: isString,
  age: isNumber,
})

type User = Infer<typeof isUser>
```

:::

This lets you write less repeated code, but the drawback is that your types are coupled to the library.

## Validate Data

The result from parsing is a tagged union with the property `tag` as discriminator:

::: code-group

```ts [Parser]
import { formatResult, object, parseString, parseNumber } from 'pure-parse'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})

// Replace `data` with your own input
const result = parseUser(data)

if (result.error) {
  console.log(formatResult(result))
  return
}

// Success!
console.log(`The user's name is "${result.value.name}"`)
```

```ts [Guard]
import { objectGuard, isString, isNumber } from 'pure-parse'

const isUser = objectGuard({
  name: isString,
  age: isNumber,
})

// Replace `data` with your own input
if (!isUser(data)) {
  console.log('The data is not a user')
  return
}

// Success!
console.log(`The user's name is "${data.name}"`)
```

:::
