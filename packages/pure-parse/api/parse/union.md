[pure-parse](../modules.md) / parse/union

# parse/union

## nullable()

```ts
function nullable<T>(parser): Parser<null | T>
```

### Type Parameters

• **T**

### Parameters

• **parser**: [`Parser`](parse.md#parsert)\<`T`\>

### Returns

[`Parser`](parse.md#parsert)\<`null` \| `T`\>

***

## optional()

```ts
function optional<T>(parser): OptionalParser<T>
```

Represent an optional property, which is different from a required property that can be `undefined`.

### Type Parameters

• **T**

### Parameters

• **parser**: [`Parser`](parse.md#parsert)\<`T`\>

### Returns

[`OptionalParser`](parse.md#optionalparsert)\<`T`\>

***

## optionalNullable()

```ts
function optionalNullable<T>(parser): OptionalParser<null | T>
```

### Type Parameters

• **T**

### Parameters

• **parser**: [`Parser`](parse.md#parsert)\<`T`\>

### Returns

[`OptionalParser`](parse.md#optionalparsert)\<`null` \| `T`\>

***

## undefineable()

```ts
function undefineable<T>(parser): Parser<undefined | T>
```

### Type Parameters

• **T**

### Parameters

• **parser**: [`Parser`](parse.md#parsert)\<`T`\>

### Returns

[`Parser`](parse.md#parsert)\<`undefined` \| `T`\>

***

## union()

```ts
function union<T>(...parsers): (data) => ParseFailure | ParseSuccess<T[number]>
```

Note that the type parameter is an array of parsers; it's not a union type.
This is because TypeScript doesn't allow you to convert unions to tuples, but it does allow you to convert tuples to unions.
Therefore, when you state the type parameter explicitly, provide an array to represent the union:
```ts
const isStringOrNumber = union<[string, number]>([isString, isNumber])
```

### Type Parameters

• **T** *extends* readonly `unknown`[]

### Parameters

• ...**parsers**: \{ \[K in string \| number \| symbol\]: Parser\<T\[K\<K\>\]\> \}

any of these parser functions must match the data.

### Returns

`Function`

#### Parameters

• **data**: `unknown`

#### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`T`\[`number`\]\>
