[pure-parse](../modules.md) / parse/parse

# parse/parse

## InfallibleParser()\<T\>

```ts
type InfallibleParser<T>: (data) => ParseSuccess<T>;
```

### Type Parameters

• **T**

### Parameters

• **data**: `unknown`

### Returns

[`ParseSuccess`](parse.md#parsesuccesst)\<`T`\>

***

## OptionalParser\<T\>

```ts
type OptionalParser<T>: object & (data) => ParseResult<T | undefined>;
```

Special parser to check optional values

### Type declaration

#### \[optionalSymbol\]?

```ts
optional [optionalSymbol]: true;
```

### Type Parameters

• **T**

***

## ParseFailure

```ts
type ParseFailure: object;
```

The parsing failed.

### Type declaration

#### error

```ts
error: string;
```

#### tag

```ts
tag: "failure";
```

***

## Parser()\<T\>

```ts
type Parser<T>: (data) => ParseResult<T>;
```

### Type Parameters

• **T**

### Parameters

• **data**: `unknown`

### Returns

[`ParseResult`](parse.md#parseresultt)\<`T`\>

***

## ParseResult\<T\>

```ts
type ParseResult<T>: ParseSuccess<T> | ParseFailure;
```

### Type Parameters

• **T**

***

## ParseSuccess\<T\>

```ts
type ParseSuccess<T>: object;
```

The data adheres to the schema. The `value` is equal to the parsed data

### Type Parameters

• **T**

### Type declaration

#### tag

```ts
tag: "success";
```

#### value

```ts
value: T;
```

***

## failure()

```ts
function failure(error): ParseFailure
```

### Parameters

• **error**: `string`

### Returns

[`ParseFailure`](parse.md#parsefailure)

***

## isFailure()

```ts
function isFailure<T>(result): result is ParseFailure
```

### Type Parameters

• **T**

### Parameters

• **result**: [`ParseResult`](parse.md#parseresultt)\<`T`\>

### Returns

`result is ParseFailure`

***

## isSuccess()

```ts
function isSuccess<T>(result): result is ParseSuccess<T>
```

### Type Parameters

• **T**

### Parameters

• **result**: [`ParseResult`](parse.md#parseresultt)\<`T`\>

### Returns

`result is ParseSuccess<T>`

***

## parseUnknown()

```ts
function parseUnknown(data): ParseSuccess<unknown>
```

Use to skip validation, as it returns true for any input.

### Parameters

• **data**: `unknown`

### Returns

[`ParseSuccess`](parse.md#parsesuccesst)\<`unknown`\>

***

## success()

```ts
function success<T>(value): ParseSuccess<T>
```

### Type Parameters

• **T**

### Parameters

• **value**: `T`

### Returns

[`ParseSuccess`](parse.md#parsesuccesst)\<`T`\>
