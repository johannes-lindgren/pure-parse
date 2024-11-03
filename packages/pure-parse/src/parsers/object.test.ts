import { describe, expect, it, test } from 'vitest'
import { objectCompiled, object } from './object'
import { isSuccess, Parser } from './types'
import { Equals, optionalSymbol } from '../internals'
import { oneOf } from './oneOf'
import {
  parseBoolean,
  parseNumber,
  parseString,
  parseUndefined,
} from './primitives'
import { Infer } from '../common'
import { literal } from './literal'
import { nullable, optional } from './optional'
import { objectMemo, objectCompiledMemo } from '../memoization'
import { succeedWith, withDefault } from './defaults'

const suites = [
  {
    name: 'object without JIT compilation',
    fn: object,
  },
  {
    name: 'object with JIT compilation',
    fn: objectCompiled,
  },
  {
    name: 'memoized object with JIT compilation',
    fn: objectCompiledMemo,
  },
  {
    name: 'memoized object without JIT compilation',
    fn: objectMemo,
  },
]

suites.forEach(({ name: suiteName, fn: object }) => {
  describe(suiteName, () => {
    describe('objects', () => {
      describe('unknown properties', () => {
        it('excludes unknown properties', () => {
          const parseObj = object({
            expected: literal(true),
          })
          const data = { expected: true, unexpected: true }
          expect(parseObj(data)).toEqual(
            expect.objectContaining({
              value: {
                expected: true,
              },
            }),
          )
        })
      })
      describe('required properties', () => {
        test('parsing', () => {
          const parseUser = object({
            id: parseNumber,
            name: parseString,
          })
          expect(parseUser({ id: 1, name: 'Alice' })).toHaveProperty(
            'tag',
            'success',
          )
          expect(parseUser({ id: 1 })).toHaveProperty('tag', 'failure')
          expect(parseUser({ name: 'Alice' })).toHaveProperty('tag', 'failure')
          expect(parseUser({})).toHaveProperty('tag', 'failure')
        })
        describe('explicit type annotation', () => {
          describe('required properties', () => {
            type User = {
              id: number
              name: string
            }
            it('has a required parser', () => {
              const parseUser1 = object<User>({
                id: parseNumber,
                name: parseString,
              })
            })
            it('does not have an optional parser', () => {
              const parseUser2 = object<User>({
                id: parseNumber,
                // @ts-expect-error -- required prop name must not be optional
                name: optional(parseString),
              })
            })
            it('must have a parser', () => {
              const parseUser3 = object<User>(
                // @ts-expect-error -- required prop name must not be omitted
                {
                  id: parseNumber,
                },
              )
            })
          })
          describe('undefinable properties', () => {
            type User = {
              name: string | undefined
            }
            it('cannot be optional', () => {
              object<User>({
                // TODO @ts-expect-error -- required prop name must not be optional
                name: optional(parseString),
              })
            })
          })
          describe('optional properties', () => {
            type User = {
              name?: string
            }
            it('cannot be required', () => {
              object<User>({
                // TODO @ts-expect-error -- required prop name must not be optional
                name: parseString,
              })
            })
            it('must be optional', () => {
              object<User>({
                name: optional(parseString),
              })
            })
          })
        })
        test('type inference', () => {
          type User = {
            id: number
            email: string
          }
          const parseUser = object({
            id: parseNumber,
            email: parseString,
          })
          type InferredUser = Infer<typeof parseUser>
          const T1: Equals<InferredUser, User> = true
          const a1: InferredUser = {
            id: 123,
            email: '',
          }
          const a2: InferredUser = {
            id: 123,
            // @ts-expect-error -- wrong type of property
            email: undefined,
          }
          // @ts-expect-error -- property is required
          const a3: InferredUser = {
            id: 123,
          }
        })
      })
      describe('required union properties', () => {
        test('parsing', () => {
          const parseUser = object({
            id: parseNumber,
            email: nullable(parseString),
          })
          expect(parseUser({ id: 1, email: null })).toHaveProperty(
            'tag',
            'success',
          )
          expect(parseUser({ id: 1, email: 'alice@test.com' })).toHaveProperty(
            'tag',
            'success',
          )
          expect(parseUser({ id: 1, email: 123 })).toHaveProperty(
            'tag',
            'failure',
          )
          expect(parseUser({ id: 1 })).toHaveProperty('tag', 'failure')
          expect(parseUser({})).toHaveProperty('tag', 'failure')
        })
      })
      describe('optional properties', () => {
        it('differentiates between undefined and missing properties', () => {
          // Just to show that toEqual lies about absent proeprties!
          expect({}).not.toHaveProperty('a')
          expect({ a: undefined }).toHaveProperty('a')
          expect({}).toEqual({ a: undefined })
          expect({ a: undefined }).toEqual({})

          const parseOptionalObj = object({
            a: optional(parseString),
          })

          const omittedParseResult = parseOptionalObj({})
          expect(parseOptionalObj({})).toHaveProperty('tag', 'success')
          if (!isSuccess(omittedParseResult)) {
            throw new Error('Should be success to continue the test')
          }
          expect(omittedParseResult.value).not.toHaveProperty('a')

          // undefined -> Success
          const undefinedParseResult = parseOptionalObj({ a: undefined })
          expect(undefinedParseResult).toHaveProperty('tag', 'success')
          if (!isSuccess(undefinedParseResult)) {
            throw new Error('Should be success to continue the test')
          }
          // undefined -> undefined
          expect(undefinedParseResult.value).toHaveProperty('a', undefined)

          const parseUnionObj = object({
            a: oneOf(parseString, parseUndefined),
          })

          expect(parseUnionObj({})).toHaveProperty('tag', 'failure')
          expect(parseUnionObj({ a: undefined })).toEqual(
            expect.objectContaining({
              tag: 'success',
              value: { a: undefined },
            }),
          )
        })
        test('parsing', () => {
          const parseUser = object({
            id: parseNumber,
            email: optional(parseString),
          })

          // Omitted -> Success
          const absentResult = parseUser({ id: 1 })
          expect(absentResult).toEqual(
            expect.objectContaining({
              tag: 'success',
              value: { id: 1 },
            }),
          )
          if (!isSuccess(absentResult)) {
            throw new Error('The result should be success')
          }
          expect(absentResult.value).not.toHaveProperty('email')

          // Undefined -> Success
          const undefinedResult = parseUser({ id: 1, email: undefined })
          expect(undefinedResult).toEqual(
            expect.objectContaining({
              tag: 'success',
              value: { id: 1, email: undefined },
            }),
          )
          if (!isSuccess(undefinedResult)) {
            throw new Error('The result should be success')
          }
          expect(undefinedResult.value).toHaveProperty('email', undefined)

          // String -> Success
          const stringResult = parseUser({ id: 1, email: 'alice@test.com' })
          expect(stringResult).toEqual(
            expect.objectContaining({
              tag: 'success',
              value: { id: 1, email: 'alice@test.com' },
            }),
          )
          if (!isSuccess(stringResult)) {
            throw new Error('The result should be success')
          }
          expect(stringResult.value).toHaveProperty('email', 'alice@test.com')

          // Number -> Failure
          expect(parseUser({ id: 1, email: 123 })).toHaveProperty(
            'tag',
            'failure',
          )
          expect(parseUser({})).toHaveProperty('tag', 'failure')
        })
        describe('type annotation', () => {
          type User = {
            id: number
            email?: string
          }
          it('has an optional parser', () => {
            const parseUser1 = object<User>({
              id: parseNumber,
              email: optional(parseString),
            })
          })
          it('can not have a required parser', () => {
            const parseUser1 = object<User>({
              id: parseNumber,
              // a required string is a subset of optional string
              email: parseString,
            })
          })
          it('does have a parser', () => {
            const parseUser3 = object<User>(
              // @ts-expect-error -- email parser must be present even though the property is optional
              {
                id: parseNumber,
              },
            )
          })
        })
        test('optional optional properties', () => {
          const parseUser = object({
            id: parseNumber,
            email: optional(optional(parseString)),
          })
        })
        describe('type inferrence', () => {
          test('required properties inference', () => {
            type User = {
              id: number
            }
            const parseUser = object({
              id: parseNumber,
            })
            type InferredUser = Infer<typeof parseUser>
            const T1: Equals<InferredUser, User> = true
            const a1: InferredUser = {
              id: 123,
            }
            // @ts-expect-error -- the property is required
            const a2: InferredUser = {}
            const a3: InferredUser = {
              // @ts-expect-error `optionalSymbol` is not included in the inferred type
              id: optionalSymbol,
            }
          })
          test('optional properties inference', () => {
            type User = {
              email?: string
            }
            type RequiredUser = {
              email: string | undefined
            }
            const parseUser = object({
              email: optional(parseString),
            })
            type InferredUser = Infer<typeof parseUser>
            // TODO email should be inferred as optional
            const t1: Equals<InferredUser, RequiredUser> = true
            const a1: InferredUser = {
              email: '',
            }
            const a2: InferredUser = {
              email: undefined,
            }
            // TODO email should be inferred as optional
            // @ts-expect-error -- unable to correctly infer optional properties
            const a3: InferredUser = {}

            const a4: InferredUser = {
              // @ts-expect-error `optionalSymbol` is not included in the inferred type
              email: optionalSymbol,
            }
          })
        })
      })
      describe('fallback', () => {
        test('optional fallbackValue', () => {
          const defaultEmail = 'default@test.com'
          const parseUser = object({
            id: parseNumber,
            name: parseString,
            email: optional(oneOf(parseString, succeedWith(defaultEmail))),
          })
          // The email can be a omitted -> Success
          expect(parseUser({ id: 1, name: 'Alice' })).toEqual(
            expect.objectContaining({
              value: { id: 1, name: 'Alice' },
            }),
          )

          // The email can be a string -> Success
          expect(
            parseUser({ id: 1, name: 'Alice', email: 'alice@test.com' }),
          ).toEqual(
            expect.objectContaining({
              value: { id: 1, name: 'Alice', email: 'alice@test.com' },
            }),
          )

          // The email can't be a number -> falls back
          expect(parseUser({ id: 1, name: 'Alice', email: 123 })).toEqual(
            expect.objectContaining({
              value: { id: 1, name: 'Alice', email: defaultEmail },
            }),
          )
        })
        it('excludes unknown properties', () => {
          const parseUser = object({
            id: parseNumber,
          })
          const data = {
            id: 123,
            unexpected: true,
          }
          expect(parseUser(data)).toEqual(
            expect.objectContaining({
              value: {
                id: 123,
              },
            }),
          )
        })
        test('required fallbackValue', () => {
          const defaultEmail = 'default@test.com'
          const parseUser = object({
            id: parseNumber,
            name: parseString,
            email: withDefault(parseString, defaultEmail),
          })

          // The property can be a string -> Success
          expect(
            parseUser({ id: 1, name: 'Alice', email: 'alice@test.com' }),
          ).toEqual(
            expect.objectContaining({
              value: { id: 1, name: 'Alice', email: 'alice@test.com' },
            }),
          )

          // number fails -> Falls back
          expect(parseUser({ id: 1, name: 'Alice', email: 123 })).toEqual(
            expect.objectContaining({
              value: { id: 1, name: 'Alice', email: defaultEmail },
            }),
          )

          // The property is required -> Fails
          expect(parseUser({ id: 1, name: 'Alice' })).toHaveProperty(
            'tag',
            'success',
          )
        })
        test('fallback on optional', () => {
          const fallbackValue = 'Anonymous'
          const providedName = 'Johannes'

          type User = {
            name: string
          }

          const parse = object<User>({
            name: withDefault(parseString, fallbackValue),
          })

          const parseInfer = object({
            name: withDefault(parseString, fallbackValue),
          })

          // Infers all properties as required
          const t1: Equals<Infer<typeof parseInfer>, User> = true

          expect(
            parse({
              name: providedName,
            }),
          ).toEqual(
            expect.objectContaining({
              tag: 'success',
              value: {
                name: providedName,
              },
            }),
          )

          // Fall back if required property was missing
          expect(parse({})).toEqual(
            expect.objectContaining({
              tag: 'success',
              value: {
                name: fallbackValue,
              },
            }),
          )
        })
      })
      describe('prototype pollution', () => {
        it('prevents prototype pollution', () => {
          const parseUser = object({
            id: parseNumber,
            name: parseString,
          })
          const data = JSON.parse(
            '{"__proto__": {"isAdmin": true}, "id": 1, "name": "Alice"}',
          )
          const result = parseUser(data)
          if (result.tag === 'failure') {
            throw new Error('Expected success')
          }
          expect(result).toEqual(
            expect.objectContaining({
              value: { id: 1, name: 'Alice' },
            }),
          )
          expect(result.value).not.toHaveProperty('isAdmin')
          expect(result.value).not.toHaveProperty('__proto__')

          // Without parsing, prototype pollution can happen
          expect(Object.assign({}, data)).toHaveProperty('isAdmin')
          // After parsing, the prototype pollution is impossible
          expect(Object.assign({}, result.value)).not.toHaveProperty('isAdmin')
        })
        it('allows you to shoot yourself in the foot, if you really want it', () => {
          const parseUser = object({
            id: parseNumber,
            name: parseString,
            ['__proto__']: object({
              isAdmin: parseBoolean,
            }),
          })
          const data = JSON.parse(
            '{"__proto__": {"isAdmin": true}, "id": 1, "name": "Alice"}',
          )
          const result = parseUser(data)
          if (result.tag === 'failure') {
            throw new Error('Expected success')
          }
          expect(result.value).toHaveProperty('isAdmin')
          expect(result.value).not.toHaveProperty('__proto__')
        })
      })
      describe('self-referential objects', () => {
        // Type inference of recursive types are impossible in TypeScript
        test('type declaration', () => {
          type Tree = {
            name: string
            left?: Tree
            right?: Tree
          }

          const parseTree: Parser<Tree> = (data) =>
            object({
              name: parseString,
              left: optional(parseTree),
              right: optional(parseTree),
            })(data)
        })
      })
      describe('errors', () => {
        it('reports non-objects', () => {
          const parse = object({
            a: parseString,
          })
          expect(parse('nonanobj')).toEqual(
            expect.objectContaining({
              tag: 'failure',
              path: [],
            }),
          )
        })
        it('reports missing properties', () => {
          const parse = object({
            a: parseString,
          })
          expect(parse({})).toEqual(
            expect.objectContaining({
              tag: 'failure',
              path: [
                {
                  tag: 'object',
                  key: 'a',
                },
              ],
            }),
          )
        })
        describe('nested errors', () => {
          it('reports shallow errors in properties', () => {
            const parse = object({
              a: parseString,
            })
            expect(parse({ a: 1 })).toEqual(
              expect.objectContaining({
                tag: 'failure',
                path: [
                  {
                    tag: 'object',
                    key: 'a',
                  },
                ],
              }),
            )
          })
          it('reports deep errors in nested properties', () => {
            const parse = object({
              a: object({
                b: parseString,
              }),
            })
            expect(parse({ a: { b: 1 } })).toEqual(
              expect.objectContaining({
                tag: 'failure',
                path: [
                  {
                    tag: 'object',
                    key: 'a',
                  },
                  {
                    tag: 'object',
                    key: 'b',
                  },
                ],
              }),
            )
          })
        })
      })
    })
  })
})
