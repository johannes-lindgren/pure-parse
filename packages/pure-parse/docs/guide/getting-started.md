# Quick Start

There is no special setup needed—just install the package and start parsing.

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

## Create a Parser

Create a [parser](parsers) by composing higher-order functions with parser primitives.

```ts
import { parse, object, parseString, parseNumber } from 'pure-parse'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})
```

## Declare the Type

Define a type alias to type-check the parser:

```ts
import { parse, object, parseString, parseNumber } from 'pure-parse'

type User = {
  name: string
  age: number
}

const parseUser = object<User>({
  name: parseString,
  age: parseNumber,
})
```

If the parser does not match the type argument (`User`), you will get a type error. This powerful feature ensures that the parsed result value always adheres to the type parameter.

## ...or Infer the Type

You can also infer the type from the parser:

```ts
import { parse, object, parseString, parseNumber, Infer } from 'pure-parse'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})

type User = Infer<typeof parseUser>
```

This lets you write less repeated code, but the drawback is that your types are coupled to the library.

## Parse data

The result from parsing is a tagged union with the property `tag` as discriminator:

```ts
// Replace `data` with your own
import { formatResult } from 'pure-parse/src'

const result = parseUser(data)

switch (result.tag) {
  case 'success':
    console.log(`The user's name is "${result.value.name}"`)
    break
  case 'failure':
    console.log(formatResult(result))
    break
}
```

## Create a Type Guards

You can create [type guards](guards) with a similar syntax:

```ts
import { guard, object, isString, isNumber } from 'pure-parse/guard'

const isUser = object({
  name: isString,
  age: isNumber,
})

if (isUser(data)) {
  console.log(`The user's name is "${data.name}"`)
} else {
  console.log('The data is not a user')
}
```
