/**
 * A value that can be encoded as JSON.
 * @example
 * ```ts
 * const value: JsonValue = {
 *   name: 'John',
 *   age: 30,
 *   isActive: true,
 *   hobbies: ['reading', 'gaming'],
 *   address: {
 *     street: '123 Main St',
 *     city: 'Anytown',
 *     zip: '12345',
 *   },
 *   metadata: null,
 * }
 * ```
 */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | { [x: string]: JsonValue }
  | JsonValue[]
