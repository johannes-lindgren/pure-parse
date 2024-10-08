# Quick Start

There is no special setup needed—just install the package and start parsing.

## Installation

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

`pure-parse` provides the means to build _parsers_ and _guard_ functions.

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

// If the parser is defined incorrectly, TypeScript will yield an error
const parseUser = object<User>({
  name: parseString,
  age: parseNumber,
})
```

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

## Parse data

The result from parsing is a tagged union with the property `tag` as discriminator:

```ts
// Replace `data` with your own
const result = parseUser(data)

switch (result.tag) {
  case 'success':
    console.log(`The user's name is "${result.value.name}"`)
    break
  case 'failure':
    console.log(`Failed to parse the user: ${result.error}`)
    break
}
```

## Create a Type Guards

You can create [type guards](guards) with a syntax:

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
