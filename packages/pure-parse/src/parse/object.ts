import { isObject } from '../guard'
import {
  failure,
  OptionalParser,
  ParseSuccess,
  Parser,
  ParseResult,
  success,
} from './types'
import { optionalSymbol } from '../internals'

/**
 * Same as {@link object}, but does not perform just-in-time (JIT) compilation with the `Function` constructor. This function is needed as a replacement in environments where `new Function()` is disallowed; for example, when the [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) policy is set without the `'unsafe-eval`' directive.
 */
export const objectNoJit = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalParser<T[K]> : Parser<T[K]>
}): Parser<T> => {
  const entries = Object.entries(schema)
  return (data) => {
    if (!isObject(data)) {
      return failure('Not an object')
    }
    const dataOutput = {} as Record<string, unknown>
    for (let i = 0; i < entries.length; i++) {
      const [key, parser] = entries[i]!
      const value = (data as Record<string, unknown>)[key]
      // Perf: only check if the property exists the value is undefined => huge performance boost
      if (value === undefined && !data.hasOwnProperty(key)) {
        if (parser[optionalSymbol] === true) {
          // The key is optional, so we can skip it
          continue
        }
        return failure('A property is missing')
      }

      const parseResult = parser(value)
      if (parseResult.tag === 'failure') {
        return failure('Not all properties are valid')
      }
      dataOutput[key] = (parseResult as ParseSuccess<unknown>).value
    }

    return success(dataOutput) as ParseResult<T>
  }
}

/**
 * Objects have a fixed set of properties that can have different types.
 * @example
 * const parseUser = object({
 *   id: parseNumber,
 *   active: parseBoolean,
 *   name: parseString,
 *   email: optional(parseString),
 * })
 * @param schema maps keys to validation functions.
 * @return a parser function that validates objects according to `schema`.
 */
export const object = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalParser<T[K]> : Parser<T[K]>
}): Parser<T> => {
  const schemaEntries = Object.entries(schema)
  const parsers = schemaEntries.map(([_, parser]) => parser)
  const statements = [
    `if(typeof data !== 'object' || data === null) return {tag:'failure', message:'Not an object'}`,
    `const dataOutput = {}`,
    `let parseResult`,
    ...schemaEntries.flatMap(([unescapedKey, parserFunction], i) => {
      const key = JSON.stringify(unescapedKey)
      // 2% faster to inline the value and parser, rather than look up once and use a variable
      // 12% faster to inline failure and success object creations
      const value = `data[${key}]`
      const parser = `parsers[${i}]`
      const isOptional = parserFunction[optionalSymbol] === true
      return [
        ...(!isOptional
          ? [
              `if(${value} === undefined && !data.hasOwnProperty(${key}))  return {tag:'failure', message:'A property is missing'}`,
            ]
          : []),
        `parseResult = ${parser}(${value})`,
        `if(parseResult.tag === 'failure') return {tag:'failure', message:'Not all properties are valid'}`,
        `dataOutput[${key}] = parseResult.value`,
      ]
    }),
    `return {tag:'success', value:dataOutput}`,
  ]
  const body = statements.join(';')
  const fun = new Function('data', 'optionalSymbol', 'parsers', body)

  return (data: unknown): ParseResult<T> => fun(data, optionalSymbol, parsers)
}
