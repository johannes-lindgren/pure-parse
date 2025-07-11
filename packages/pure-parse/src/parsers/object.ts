import { isObject } from '../guards'
import { OptionalParser, Parser } from './Parser'
import { failure, ParseSuccess, propagateFailure, success } from './ParseResult'
import { omitProperty, propertyAbsent } from '../internals'
import { Infer, lazy } from '../common'
import { OptionalKeys, WithOptionalFields } from '../internals/utility-types'

const notAnObjectMsg = 'Not an object'

const missingPropertyError = (key: string) =>
  propagateFailure(
    failure(`Expected property ${JSON.stringify(key)} to be present`),
    {
      tag: 'object',
      key,
    },
  )

/**
 * Objects have a fixed set of properties of different types.
 * If the `data` received has properties that are not declared in the parser,
 * the extra properties are omitted from the result.
 * @see {@link objectStrict} for a strict version.
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
}): /* The reason for the conditional is twofold:
 * 1. When inferring `T` from a schema with optional properties, `T` gets inferred with required properties, where the property values instead are union with `omitProperty`.
 * 2. When `T` is explicitly declared, we do not want to use the expression because we want the return type to be printed in the IDE as `Parser<T>`.
 *    For example, `object<User>(...)` should return `Parser<User>`, not `Parser<{ id: number; name?: string; }>`.
 */
Parser<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>> => {
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
 * @see {@link object} for a non-compiled version of this function.
 * @see {@link lazy} for deferring the JIT compilation.
 * @see {@link objectStrictCompiled} for a strict version.
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
    `if(typeof data !== 'object' || data === null) return {tag:'failure', error: { message: ${JSON.stringify(
      notAnObjectMsg,
    )}, path: [] }}`,
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
          if(parseResult.tag === 'failure') return {tag: 'failure', error: { message: parseResult.error.message, path:[{tag:'object', key:${key}}, ...parseResult.error.path] }}
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

/**
 * Like `object`, but fails when the input `data` object has undeclared properties.
 * Although `object` removes undeclared properties from the result,
 * there are scenarios where you want to reject the input if it has extra properties.
 * @see {@link object} for a non-strict version.
 * @example
 * When designing APIs, you want to reject calls to the API that includes undeclared properties,
 * as this will allow you to add new properties in the future without breaking changes.
 *
 * For example, consider a REST API endpoint `PUT /user/:id`, which is validating the body with the non-strict object parser:
 * ```ts
 * const handlePutUser = (body: unknown) => {
 *  const parseBody = object({
 *    id: parseNumber,
 *    name: parseString,
 *  })
 * }
 * ```
 * A client decides to call it with an extra property `email`:
 * ```ts
 * fetch('/user/1', {
 *  method: 'PUT',
 *  body: JSON.stringify({
 *    id: 123,
 *    name: 'Alice',
 *    email: null
 * }),
 * ```
 * Since `handlePutUser` does not reject the API call, the client's success will succeed.
 *
 * Now, the backend is updated to include the email property:
 * ```ts
 * const handlePutUser = (body: unknown) => {
 *  const parseBody = object({
 *    id: parseNumber,
 *    name: parseString,
 *    email: optional(parseString),
 *  })
 * }
 * ```
 * That is, `email` is optional, but not nullable.
 * If the client now sends the same request, it will suddenly fail.
 *
 * To avoid such breaking change, use `objectStrict`:
 * ```ts
 * const handlePutUser = (body: unknown) => {
 *  const parseBody = objectStrict({
 *    id: parseNumber,
 *    name: parseString,
 *  })
 * }
 * ```
 * @param schema
 */
export const objectStrict = <T extends Record<string, unknown>>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalParser<T[K]> : Parser<T[K]>
}): /* The reason for the conditional is twofold:
 * 1. When inferring `T` from a schema with optional properties, `T` gets inferred with required properties, where the property values instead are union with `omitProperty`.
 * 2. When `T` is explicitly declared, we do not want to use the expression because we want the return type to be printed in the IDE as `Parser<T>`.
 *    For example, `object<User>(...)` should return `Parser<User>`, not `Parser<{ id: number; name?: string; }>`.
 */
Parser<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>> => {
  const parseLoose = object(schema)
  const schemaKeys = new Set(Object.keys(schema))

  return (data) => {
    if (!isObject(data)) {
      return failure(notAnObjectMsg)
    }
    const dataKeys = Object.keys(data)
    for (const key of dataKeys) {
      if (!schemaKeys.has(key)) {
        return failure(`Object has an extra property ${JSON.stringify(key)}`)
      }
    }
    return parseLoose(data)
  }
}

/**
 * Like `objectCompiled`, but fails when the input `data` object has undeclared properties in the same manner as `objectStrict`.
 * @see {@link objectStrict} for a non-compiled version.
 * @see {@link objectCompiled} for a non-strict version.
 * @param schema
 */
export const objectStrictCompiled = <
  T extends Record<string, unknown>,
>(schema: {
  // When you pick K from T, do you get an object with an optional property, which {} can be assigned to?
  [K in keyof T]-?: {} extends Pick<T, K> ? OptionalParser<T[K]> : Parser<T[K]>
}): /* The reason for the conditional is twofold:
 * 1. When inferring `T` from a schema with optional properties, `T` gets inferred with required properties, where the property values instead are union with `omitProperty`.
 * 2. When `T` is explicitly declared, we do not want to use the expression because we want the return type to be printed in the IDE as `Parser<T>`.
 *    For example, `object<User>(...)` should return `Parser<User>`, not `Parser<{ id: number; name?: string; }>`.
 */
Parser<OptionalKeys<T> extends undefined ? T : WithOptionalFields<T>> => {
  const parseLoose = objectCompiled(schema)
  const schemaKeys = new Set(Object.keys(schema))

  return (data) => {
    if (!isObject(data)) {
      return failure(notAnObjectMsg)
    }
    const dataKeys = Object.keys(data)
    for (const key of dataKeys) {
      if (!schemaKeys.has(key)) {
        return failure(`Object has an extra property ${JSON.stringify(key)}`)
      }
    }
    return parseLoose(data)
  }
}
