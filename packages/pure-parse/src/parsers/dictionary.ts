import { Parser } from './Parser'
import { failure, propagateFailure, success } from './ParseResult'
import { isObject } from '../guards'

/**
 * Dictionaries are objects where all properties are optional and have the same type.
 * In TypeScript, this can be represented by `Partial<Record<string, ?>>`.
 * @example
 * Validate a word dictionary:
 * ```ts
 * const parseDictionary = dictionary(isString, isString)
 * parseDictionary({ hello: 'world' }) // -> Success
 * parseDictionary({ hello: 1 }) // -> Failure
 * ```
 * @example
 * You can transform the keys and values; for example, to only allow lowercase strings:
 * ```ts
 * const parseLowerCase = (data: unknown): data is Lowercase<string> =>
 *   typeof data === 'string' ? failure('Not a string') : success(data.toLowerCase())
 * const parseDictionary = dictionary(parseLowerCase, parseLowerCase)
 * parseDictionary({ hello: 'world' }) // -> Success<{ hello: 'world' }>
 * parseDictionary({ Hello: 'world' }) // -> Success<{ hello: 'world' }>
 * parseDictionary({ hello: 'World' }) // -> Success<{ hello: 'world' }>
 * ```
 * @param parseKey parses every key
 * @param parseValue parses every value
 * @returns a parser for a dictionary, of type `Partial<Record<K, V>>`
 */
export const dictionary =
  <K extends string, V>(
    parseKey: Parser<K>,
    parseValue: Parser<V>,
  ): Parser<Partial<Record<K, V>>> =>
  (data) => {
    if (!isObject(data)) {
      return failure('Expected type object')
    }
    const resultData: Partial<Record<K, V>> = {}
    for (const key in data) {
      const value = (data as Record<string | symbol, unknown>)[key]
      const parsedKey = parseKey(key)
      if (parsedKey.tag === 'failure') {
        return propagateFailure(failure('Invalid property key'), {
          tag: 'object',
          key,
        })
      }
      const parsedValue = parseValue(value)
      if (parsedValue.tag === 'failure') {
        return propagateFailure(failure('Invalid property value'), {
          tag: 'object',
          key,
        })
      }
      resultData[parsedKey.value] = parsedValue.value
    }
    return success(resultData)
  }
