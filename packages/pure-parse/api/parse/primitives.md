[pure-parse](../modules.md) / parse/primitives

# parse/primitives

## literal()

```ts
function literal<T>(...constants): (data) => ParseFailure | ParseSuccess<T[number]>
```

### Type Parameters

• **T** *extends* readonly [`Primitive`](../common/Primitive.md#primitive)[]

### Parameters

• ...**constants**: `T`

One or more primitive values that are compared against `data` with the `===` operator.

### Returns

`Function`

#### Parameters

• **data**: `unknown`

#### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`T`\[`number`\]\>

***

## parseBigInt()

```ts
function parseBigInt(data): ParseFailure | ParseSuccess<bigint>
```

### Parameters

• **data**: `unknown`

### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`bigint`\>

***

## parseBoolean()

```ts
function parseBoolean(data): ParseFailure | ParseSuccess<boolean>
```

### Parameters

• **data**: `unknown`

### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`boolean`\>

***

## parseNull()

```ts
function parseNull(data): ParseFailure | ParseSuccess<null>
```

### Parameters

• **data**: `unknown`

### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`null`\>

***

## parseNumber()

```ts
function parseNumber(data): ParseFailure | ParseSuccess<number>
```

### Parameters

• **data**: `unknown`

### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`number`\>

***

## parseString()

```ts
function parseString(data): ParseFailure | ParseSuccess<string>
```

### Parameters

• **data**: `unknown`

### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`string`\>

***

## parseSymbol()

```ts
function parseSymbol(data): ParseFailure | ParseSuccess<symbol>
```

### Parameters

• **data**: `unknown`

### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`symbol`\>

***

## parseUndefined()

```ts
function parseUndefined(data): ParseFailure | ParseSuccess<undefined>
```

### Parameters

• **data**: `unknown`

### Returns

[`ParseFailure`](parse.md#parsefailure) \| [`ParseSuccess`](parse.md#parsesuccesst)\<`undefined`\>
