import { isObject } from '../guards'
import {
  failure,
  OptionalParser,
  ParseSuccess,
  Parser,
  success,
  propagateFailure,
} from './types'
import { OmitProperty, omitProperty, propertyAbsent } from '../internals'
import { Infer } from '../common'
import { lazy } from '../common'

const notAnObjectMsg = 'Not an object'

const missingPropertyError = (key: string) =>
  propagateFailure(failure('Property is missing'), {
    tag: 'object',
    key,
  })

export type Values<T> = keyof T extends never ? never : T[keyof T]

export type OptionalKeys<T> = Values<{
  [K in keyof T]: unknown extends T[K]
    ? never
    : OmitProperty extends T[K]
      ? K
      : never
}>

export type RequiredKeys<T> = Values<{
  [K in keyof T]: unknown extends T[K]
    ? K
    : OmitProperty extends T[K]
      ? never
      : K
}>

export type Simplify<T> = T extends infer _ ? { [K in keyof T]: T[K] } : never

export type WithOptionalFields<T> = Simplify<
  {
    [K in RequiredKeys<T>]: Exclude<T[K], OmitProperty>
  } & {
    [K in OptionalKeys<T>]?: Exclude<T[K], OmitProperty>
  }
>

/**
 * Objects have a fixed set of properties of different types.
 * If the `data` received has properties that are not declared in the parser,
 * the extra properties are omitted from the result.
 * @example
 * Object with both required and optional properties:
 * ```ts
 * const parseUser = object({
 *   id: parseNumber,
 *   active: parseBoolean,
 *   name: parseString,
 *   email: optional(parseString),
 * })
 * ```
 * @example
 * Annotate explicitly:
 * ```ts
 * type User = {
 *   id: number
 *   name?: string
 * }
 *
 * const parseUser = object<User>({
 *   id: parseNumber,
 *   name: optional(parseString),
 * })
 * ```
 * @limitations Optional `unknown` properties will be inferred as required.
 * See {@link Infer} > limitations for in-depth information.
 * @param schema maps keys to validation functions.
 * @return a parser function that validates objects according to `schema`.
 */
export const object = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalParser<T[K]> : Parser<T[K]>
}): Parser<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>> => {
  const entries = Object.entries(schema)
  return (data) => {
    if (!isObject(data)) {
      return failure(notAnObjectMsg)
    }
    const dataOutput = {} as Record<string, unknown>
    for (let i = 0; i < entries.length; i++) {
      const [key, parser] = entries[i]!
      const value = (data as Record<string, unknown>)[key]
      // Perf: only check if the property exists the value is undefined => huge performance boost
      if (value === undefined && !data.hasOwnProperty(key)) {
        // Property is absent
        const parseResult = parser(propertyAbsent)
        if (
          parseResult.tag === 'failure' ||
          // parseUnknown could return the same value as it received
          parseResult.value === propertyAbsent
        ) {
          return missingPropertyError(key)
        }
        // If the parse result indicates that the parsed result should be an
        // omitted property, this conditional will be skipped
        if (parseResult.value !== omitProperty) {
          // Can happen in case of withDefault, where parsing an optional property does lead to a value
          dataOutput[key] = (parseResult as ParseSuccess<unknown>).value
        }
      } else {
        // Property is present
        const parseResult = parser(value)
        if (parseResult.tag === 'failure') {
          return propagateFailure(parseResult, { tag: 'object', key })
        }
        dataOutput[key] = (parseResult as ParseSuccess<unknown>).value
      }
    }

    return success(
      dataOutput as OptionalKeys<T> extends undefined
        ? T
        : WithOptionalFields<T>,
    )
  }
}

/**
 * Same as {@link object}, but performs just-in-time (JIT) compilation with the `Function` constructor, which greatly increases the execution speed of the validation.
 * However, the JIT compilation is slow and gets executed at the time when the validation function is constructed.
 * When invoking this function at the module level, it is recommended to wrap it in {@link lazy} to defer the JIT compilation to when the validation function is called for the first time.
 * This function will be blocked in environments where the `Function` constructor is blocked; for example, when the [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) policy is set without the `'unsafe-eval`' directive.
 * @example
 * Defer the JIT compilation to when the validation function is called for the first time.
 * ```ts
 * const isUser = lazy(() => objectCompiled({
 *  id: isNumber,
 *  name: isString,
 * })
 * ```
 * @see {@link object} for a non-just-in-time compiled version of this function.
 * @param schema maps keys to validation functions.
 */
export const objectCompiled = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalParser<T[K]> : Parser<T[K]>
}): Parser<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>> => {
  const schemaEntries = Object.entries(schema)
  const parsers = schemaEntries.map(([_, parser]) => parser)
  const statements = [
    `if(typeof data !== 'object' || data === null) return {tag:'failure', error: ${JSON.stringify(
      notAnObjectMsg,
    )}, path: []}`,
    `const dataOutput = {}`,
    `let parseResult`,
    ...schemaEntries.map(([unescapedKey, parserFunction], i) => {
      const key = JSON.stringify(unescapedKey)
      // 2% faster to inline the value and parser, rather than look up once and use a variable
      // 12% faster to inline failure and success object creations
      const value = `data[${key}]`
      const parser = `parsers[${i}]`
      return `
        if(${value} === undefined && !data.hasOwnProperty(${key}))  {
          const parseResult = ${parser}(propertyAbsent)
          if(parseResult.tag === 'failure' || parseResult.value === propertyAbsent){
            return ${JSON.stringify(missingPropertyError(unescapedKey))}
          }
          if(parseResult.value !== omitProperty){
            dataOutput[${key}] = parseResult.value
          } 
        } else {
          parseResult = ${parser}(${value})
          if(parseResult.tag === 'failure') return {tag:'failure', error: parseResult.error, path:[{tag:'object', key:${key}}, ...parseResult.path]}
          dataOutput[${key}] = parseResult.value
        }`
    }),
    `return {tag:'success', value:dataOutput}`,
  ]
  const body = statements.join(';')
  const fun = new Function(
    'data',
    'propertyAbsent',
    'omitProperty',
    'parsers',
    body,
  )

  return (data) => fun(data, propertyAbsent, omitProperty, parsers)
}
