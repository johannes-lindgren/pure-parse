[pure-parse](../modules.md) / parse/fallback

# parse/fallback

## fallback()

```ts
function fallback<T, F>(parser, defaultValue): InfallibleParser<T | F>
```

Use to provide a default value when parsing fails.

### Type Parameters

• **T**

• **F**

### Parameters

• **parser**: [`Parser`](parse.md#parsert)\<`T`\>

• **defaultValue**: `F`

### Returns

[`InfallibleParser`](parse.md#infallibleparsert)\<`T` \| `F`\>
