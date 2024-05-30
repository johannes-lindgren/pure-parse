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
> = T extends (data: unknown, ...args: unknown[]) => data is infer R ? R : never

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
 * Used to respresent optional validators at runtime and compile-time in two different ways
 */
const optionalSymbol = Symbol('optional')

/**
 * Special validator to check optional values
 */
type OptionalValidator<T> = { [optionalSymbol]: true } & ((
  data: unknown,
) => data is typeof optionalSymbol)

/**
 * Represent an optional property, which is different from a required property that can be `undefined`.
 * @param validator
 */
export const optional = <T>(validator: Validator<T>): OptionalValidator<T> =>
  /*
   * This function uses two tricks:
   *  1. { [optionalValue]: true } is used at runtime by `object` to check if a validator represents an optional value.
   *  2. The return type is a symbol so that it in generic conditional expressions, it does not overlap with Validator.
   */
  Object.assign(union(isUndefined, validator), {
    [optionalSymbol]: true,
  }) as OptionalValidator<T>

/**
 * Create an optional property that also can be `null`. Convenient when creating optional nullable properties in objects. Alias for optional(union(isNull, validator)).
 * @param validator
 */
export const optionalNullable = <T>(validator: Validator<T>) =>
  optional(union(isNull, validator))

/**
 * Create a union with `null`. Convenient when creating nullable properties in objects. Alias for union(isNull, validator).
 * @param validator
 */
export const nullable = <T>(validator: Validator<T>) => union(isNull, validator)

/**
 * Create a union with `undefined`, which is different from optional properties. Alias for union(isUndefined, validator).
 * @param validator
 */
export const undefineable = <T>(validator: Validator<T>) =>
  union(isUndefined, validator)

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
    [K in keyof T]-?: {} extends Pick<T, K>
      ? OptionalValidator<T[K]>
      : Validator<T[K]>
  }) =>
  (
    data: unknown,
  ): data is Required<Pick<T, RequiredKeys<T>>> &
    Partial<Pick<T, OptionalKeys<T>>> =>
    typeof data === 'object' &&
    data !== null &&
    Object.keys(schema).every((key) => {
      const validator = schema[key]
      if (validator === undefined) {
        // TODO this shouldn't happen, as the type ensures that all properties are validators
        return false
      }
      if (!(key in data)) {
        // If the key is not present, the validator must represent an optional property
        return optionalSymbol in validator
      }
      // @ts-ignore - we check that the key is present on the line above
      const value = data[key]

      return validator(value)
    })

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

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
 * Validate arrays
 * @param validateItem validates every item in the array
 * @return a validator function that validates arrays
 */
export const array =
  <T>(validateItem: Validator<T>): Validator<T[]> =>
  (data: unknown): data is T[] =>
    Array.isArray(data) && data.every(validateItem)

/**
 * Validate non-empty arrays
 * @param validateItem validates every item in the array
 * @return a validator function that validates non-empty arrays
 */
export const nonEmptyArray =
  <T>(validateItem: Validator<T>): Validator<[T, ...T[]]> =>
  (data: unknown): data is [T, ...T[]] =>
    Array.isArray(data) && data.length !== 0 && data.every(validateItem)

/**
 * Use this when the data that you want to validate is already a known array
 * @param data an array
 * @return `true` if data has at least one element
 */
export const isNonEmptyArray = <T>(data: T[]): data is [T, ...T[]] =>
  data.length !== 0
