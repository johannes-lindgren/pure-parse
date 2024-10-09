# Parsers

Parsers are functions that accepts an `unknown` argument and returns a discriminated union, which is either a success or a failure:

```ts
type Parser<T>: (data) => ParseResult<T>
```

To find out whether the parsing was successful, read the `tag` property of the result:

```ts
import { parse, object, parseString, parseNumber } from 'pure-parse'
import data from 'my-data.json'

const parseUser = object({
  name: parseString,
  age: parseNumber,
})

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
