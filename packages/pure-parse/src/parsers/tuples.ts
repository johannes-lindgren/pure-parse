import { failure, Parser, ParseSuccess, success } from './types'

/**
 * Construct parsers for tuples.
 * If the `data` has more elements than expected, the extra elements are omitted from the result.
 * @example
 * Parse 2D coordinates:
 * ```ts
 * const parseVector2 = tuple([parseNumber, parseNumber])
 * parseVector2([12.5, 45.0]) // -> ParseSuccess<[number, number]>
 * ```
 * @example
 * Declare the type explicitly with type arguments:
 * ```ts
 * const parseVector2 = tuple<[number, number]>([parseNumber, parseNumber])
 * parseVector2([12.5, 45.0]) // -> ParseSuccess<[number, number]>
 * ```
 * @param parsers an array of parsers. Each parser validates the corresponding element in the data tuple.
 * @returns a parser that validates tuples.
 */
export const tuple =
  <T extends readonly [...unknown[]]>(
    parsers: [
      ...{
        [K in keyof T]: Parser<T[K]>
      },
    ],
  ): Parser<T> =>
  (data) => {
    if (!Array.isArray(data)) {
      return failure('not an array')
    }
    if (data.length < parsers.length) {
      return failure(
        `the data has ${data.length} elements but ${parsers.length} are required`,
      )
    }
    const dataOutput = []
    for (let i = 0; i < parsers.length; i++) {
      const parser = parsers[i]
      const value = data[i]
      const parseResult = parser(value)
      if (parseResult.tag === 'failure') {
        return failure(`failed parsing index ${i}`)
      }
      dataOutput.push(parseResult.value)
    }
    return success(dataOutput) as unknown as ParseSuccess<T>
  }
