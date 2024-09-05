/*
 * Utility functions that are local to this library. They are not exposed.
 */

export const hasKey = <Key extends string>(
  data: object,
  key: Key,
): data is { [K in Key]: unknown } => key in data
