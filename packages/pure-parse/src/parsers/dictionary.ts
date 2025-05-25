import { Parser } from './Parser'
import { failure, propagateFailure, success } from './ParseResult'
import { isObject } from '../guards'

/**
 * Dictionaries are objects that map strings to other values.
 *
 * Due to how TypeScript works, this function has two behaviors at the type level, depending on `Key` (At runtime, it always behaves the same):
 * - When the key is `string`, it validates `Record<string, V>`. When `noUncheckedIndexedAccess` is enabled, TypeScript understands that a value retrieved with a string the value can be `undefined`. However, the value is _not semantically identical_ to `Partial<Record<string, V>>`.
 * - When the key is a subset of `string`, it validates `Partial<Record<K, V>>`. If the properties were not marked as optional, TypeScript would assume that all keys map to values.
 *
 * @example
 * Validate a dictionary:
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
 * @returns a parser for a record
 */
export const dictionary =
  <K extends string, V>(
    parseKey: Parser<K>,
    parseValue: Parser<V>,
  ): Parser<string extends K ? Record<K, V> : Partial<Record<K, V>>> =>
  (data) => {
    if (!isObject(data)) {
      return failure('Expected type object')
    }
    const resultData: Record<string, V> = {}
    for (const key in data) {
      // This type assertion just makes TypeScript allow us to index with a key
      const value = (data as Record<keyof any, unknown>)[key]
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
    return success(
      resultData as string extends K ? Record<K, V> : Partial<Record<K, V>>,
    )
  }
