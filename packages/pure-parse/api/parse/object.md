[pure-parse](../modules.md) / parse/object

# parse/object

## object()

```ts
function object<T>(schema): (data) => ParseResult<T>
```

Validate structs; records that map known keys to a specific type.

```ts
const parseUser = object({
  id: parseNumber,
  uid: parseString,
  active: parseBoolean,
  name: optional(parseString),
})
```

### Type Parameters

• **T** _extends_ `Record`\<`string`, `unknown`\>

### Parameters

• **schema**: \{ \[K in string \| number \| symbol\]-?: Object extends Pick\<T, K\> ? OptionalParser\<T\[K\]\> : Parser\<T\[K\]\> \}

maps keys to validation functions.

### Returns

`Function`

#### Parameters

• **data**: `unknown`

#### Returns

[`ParseResult`](parse.md#parseresultt)\<`T`\>
