/**
 * A value that represent any JSON-serializable data.
 */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | { [x: string]: JsonValue }
  | JsonValue[]
