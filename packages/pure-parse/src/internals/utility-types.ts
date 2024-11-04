import { OmitProperty } from './optionalSymbol'

/**
 * Used to index an object. The benefit of this over `T[keyof T]` is that `T[keyof {}]` gives `undefined`, while `Values<{}>` gives `never`.
 */
export type Values<T> = keyof T extends never ? never : T[keyof T]

export type OptionalKeys<T> = Values<{
  [K in keyof T]: unknown extends T[K]
    ? never
    : OmitProperty extends T[K]
      ? K
      : never
}>

export type RequiredKeys<T> = Values<{
  [K in keyof T]: unknown extends T[K]
    ? K
    : OmitProperty extends T[K]
      ? never
      : K
}>

/**
 * Takes a complex type expression and simplifies it to a plain object. Useful when inferring types.
 */
export type Simplify<T> = T extends infer _ ? { [K in keyof T]: T[K] } : never

export type WithOptionalFields<T> = Simplify<
  {
    [K in RequiredKeys<T>]: Exclude<T[K], OmitProperty>
  } & {
    [K in OptionalKeys<T>]?: Exclude<T[K], OmitProperty>
  }
>
