/**
 * Check whether two types are equal. `true` if they are, `false` if not.
 * Useful for testing generics.
 */
export type Equals<T1, T2> = T1 extends T2
  ? T2 extends T1
    ? true
    : false
  : false
