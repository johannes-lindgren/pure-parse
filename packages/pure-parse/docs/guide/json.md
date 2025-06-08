# JSON

PureParse provides some functionality for parsing JSON strings.

## Parsing JSON strings (`parseJson`)

[parseJson](/api/parsers/json#parseJson) is a wrapper around `JSON.parse` which catches any errors and turns them into failures. The `Result` type is [JsonValue](/api/common/json#JsonValue) (unlike `JSON.parse`, which returns `any`):

```ts
parseJson('{"key": "value"}') // -> ParseSuccess<JsonValue>
parseJson('123') // -> ParseSuccess<JsonValue>
```

The value must be a JSON-string:

```ts
parseJson('not a json string') // -> ParseFailure
parseJson(123) // -> ParseFailure
parseJson(null) // -> ParseFailure
```

## Validating the Parsed Results With `chain`

To validate that the parsed JSON adhere, [chain](/api/parsers/Parser.md#chain) together `parseJson` with a custom parser:

```ts
const parseUserJson = chain(parseJson, parseUser)

parseUserJson('{"name": "John", "age": 30}') // -> ParseSuccess<User>
```

## Validating JSON values (`isJsonValue`)

To verify that a value can be encoded as JSON—without any custom encoding—use [isJsonValue](/api/guards/json#isJsonValue):

```ts
isJsonValue('abc') // -> true
isJsonValue({ key: 'value' }) // -> true
isJsonValue([1, 2, 3]) // -> true

isJsonValue(new Date()) // -> false
isJsonValue(() => {}) // -> false
isJsonValue(Symbol('foo')) // -> false
```
