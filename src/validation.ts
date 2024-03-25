/*
 * Utility Types
 */

/**
 * A function that return a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates) on the argument.
 */
export type Validator<T> = (data: unknown) => data is T

/**
 * Extract the type in the [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates).
 */
export type Infer<
  T extends (data: unknown, ...args: unknown[]) => data is unknown,
> = T extends (data: unknown, ...args: unknown[]) => data is infer R
  ? R
  : unknown

/**
 * Use to skip validation, as it returns true for any input.
 * @param data
 */
export const isUnknown = (data: unknown): data is unknown => true

/*
 * Primitives
 */

export const isNull = (data: unknown): data is null => data === null
export const isUndefined = (data: unknown): data is undefined =>
  typeof data === 'undefined'

export const isBoolean = (data: unknown): data is boolean =>
  typeof data === 'boolean'

export const isNumber = (data: unknown): data is number =>
  typeof data === 'number'

export const isString = (data: unknown): data is string =>
  typeof data === 'string'

export const isBigInt = (data: unknown): data is bigint =>
  typeof data === 'bigint'

export const isSymbol = (data: unknown): data is symbol =>
  typeof data === 'symbol'

/*
 *
 * Algebraic Data Types
 *
 */

/*
 * "Constant" Types
 */

/**
 * A JavaScript primitive
 */
export type Primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | bigint
  | symbol

/*
 * Higher order functions
 */

/**
 *
 * @param constants compared against `data` with the `===` operator.
 */
export const literal =
  <const T extends readonly [...Primitive[]]>(
    ...constants: T
  ): Validator<T[number]> =>
  (data: unknown): data is T[number] =>
    constants.some((constant) => constant === data)

/*
 * Sum Types
 */

/**
 * Note that the type parameter is an array of validators; it's not a union type.
 * This is because TypeScript doesn't allow you to convert unions to tuples, but it does allow you to convert tuples to unions.
 * Therefore, when you state the type parameter explicitly, provide an array to represent the union:
 * ```ts
 * const isStringOrNumber = union<[string, number]>([isString, isNumber])
 * ```
 * @param validators any of these validator functions must match the data.
 */
export const union =
  <T extends readonly [...unknown[]]>(
    ...validators: {
      [K in keyof T]: Validator<T[K]>
    }
  ) =>
  (data: unknown): data is T[number] =>
    validators.some((validator) => validator(data))

/**
 * Create a union with `undefined`. Convenient when creating optional properties in objects. Alias for union([isUndefined, validator]).
 * @param validator
 */
export const optional = <T>(validator: Validator<T>) =>
  union(isUndefined, validator)

/**
 * Create a union with `undefined`. Convenient when creating nullable properties in objects. Alias for union([isNull, validator]).
 * @param validator
 */
export const nullable = <T>(validator: Validator<T>) => union(isNull, validator)

/**
 * Create a union with `undefined`. Convenient when creating optional nullable properties in objects. Alias for union([isUndefined, isNull, validator]).
 * @param validator
 */
export const optionalNullable = <T>(validator: Validator<T>) =>
  union(isUndefined, isNull, validator)

/*
 * Product Types
 */

/**
 * @param validators an array of validators. Each validator validates the corresponding element in the data tuple.
 */
export const tuple =
  <T extends readonly [...unknown[]]>(
    validators: [
      ...{
        [K in keyof T]: Validator<T[K]>
      },
    ],
  ): Validator<T> =>
  (data: unknown): data is T =>
    Array.isArray(data) &&
    data.length === validators.length &&
    validators.every((validator, index) => validator(data[index]))

// NOTE: In TypeScript, it's not possible to remove the union with undefined from an optional property, so the optional
//  types will be types as ?: undefined | ...
// NOTE: The type below is complex. It could be made shorter by defining utility types. But these utility types end up
//  in the final type signature of the type guard (which we don't want) and therefore I am inlining.
/**
 * Validate structs; records that map known keys to a specific type.
 *
 * ```ts
 * const isUser = object({
 *   id: isNumber,
 *   uid: isString,
 *   active: isBoolean,
 * })
 * ```
 * @param schema maps keys to validation functions.
 */
export const object =
  <T extends Record<string, unknown>>(schema: {
    [K in keyof T]: Validator<T[K]>
  }) =>
  (
    data: unknown,
  ): data is {
    [K in {
      [K in keyof T]-?: undefined extends T[K] ? never : K
    }[keyof T]]: T[K]
  } & {
    [K in {
      [K in keyof T]-?: undefined extends T[K] ? K : never
    }[keyof T]]?: T[K]
  } =>
    typeof data === 'object' &&
    data !== null &&
    Object.keys(schema).every(
      (key) =>
        // We have force TypeScript to consider `data` as a record, otherwise it won't allow us to index `data` with a string (TS7053).
        schema[key]?.((data as Record<string, unknown>)[key]),
    )

/**
 * Validate `Record<?, ?>`; objects that definitely map strings to another specific type.
 * @param keys a list of every possible key
 * @param validateValue validates every value
 */
export const record =
  <Keys extends readonly [...string[]], Value>(
    keys: Keys,
    validateValue: Validator<Value>,
  ): Validator<Record<Keys[number], Value>> =>
  (data: unknown): data is Record<Keys[number], Value> =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    // No extra keys
    Object.keys(data).every((key) => keys.includes(key)) &&
    // Every value is valid
    Object.values(data).every(validateValue) &&
    // Either: a) undefined is a valid value, or b) every key is present
    (validateValue(undefined) || keys.every((key) => key in data))

/**
 * Validate `Partial<Record<?, ?>>`; objects that optionally map strings to another specific type.
 * @param validKey validates every key
 * @param validateValue validates every value
 */
export const partialRecord =
  <Key extends string, Value>(
    validKey: Validator<Key>,
    validateValue: Validator<Value>,
  ): Validator<Partial<Record<Key, Value>>> =>
  (data: unknown): data is Partial<Record<Key, Value>> =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    // No extra keys
    Object.keys(data).every(validKey) &&
    // Every value is valid
    Object.values(data).every(validateValue)

/*
 * Recursive Types
 */

/**
 * @param validateItem validates every item in the array
 */
export const array =
  <T extends unknown[]>(validateItem: Validator<T[number]>): Validator<T> =>
  (data: unknown): data is T =>
    Array.isArray(data) && data.every(validateItem)
