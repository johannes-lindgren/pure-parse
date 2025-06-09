import { Guard } from './Guard'

/**
 * @param guards an array of guards. Each guard validates the corresponding element in the data tuple.
 */
export const tupleGuard =
  <T extends readonly [...unknown[]]>(
    guards: [
      ...{
        [K in keyof T]: Guard<T[K]>
      },
    ],
  ): Guard<T> =>
  (data: unknown): data is T =>
    Array.isArray(data) &&
    data.length === guards.length &&
    guards.every((guard, index) => guard(data[index]))
