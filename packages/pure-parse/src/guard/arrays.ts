import { Guard } from './types'

/**
 * Validate arrays
 * @param itemGuard validates every item in the array
 * @return a guard function that validates arrays
 */
export const arrayGuard =
  <T>(itemGuard: Guard<T>): Guard<T[]> =>
  (data: unknown): data is T[] =>
    Array.isArray(data) && data.every(itemGuard)

/**
 * Validate non-empty arrays
 * @param itemGuard validates every item in the array
 * @return a guard function that validates non-empty arrays
 */
export const nonEmptyArray =
  <T>(itemGuard: Guard<T>): Guard<[T, ...T[]]> =>
  (data: unknown): data is [T, ...T[]] =>
    Array.isArray(data) && data.length !== 0 && data.every(itemGuard)
