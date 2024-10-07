[pure-parse](../modules.md) / common/Infer

# common/Infer

## Infer\<T\>

```ts
type Infer<T>: T extends Parser<infer R> ? R : T extends Guard<infer R> ? R : never;
```

Extract the type from a parser or guards
- In parsers, extract the type in the type parameter.
- In guards, extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).

### Type Parameters

• **T** *extends* `Guard`\<`unknown`\> \| [`Parser`](../parse/parse.md#parsert)\<`unknown`\>

— a parser or guard
