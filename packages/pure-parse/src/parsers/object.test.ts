import { describe, expect, it, test } from 'vitest'
import {
  objectCompiled,
  object,
  objectStrict,
  objectStrictCompiled,
} from './object'
import { Parser } from './Parser'
import { isSuccess } from './ParseResult'
import { Equals, omitProperty } from '../internals'
import { oneOf } from './oneOf'
import {
  parseBoolean,
  parseNumber,
  parseString,
  parseUndefined,
} from './primitives'
import { Infer } from '../common'
import { equals } from './equals'
import { nullable, optional, undefineable } from './optional'
import {
  objectMemo,
  objectCompiledMemo,
  objectStrictCompiledMemo,
  objectStrictMemo,
} from '../memoization'
import { withDefault } from './withDefault'
import { parseUnknown } from './unknown'

const looseSuites = [
  // Non-compiled
  {
    name: 'object without JIT compilation',
    fn: object,
  },
  {
    name: 'object with JIT compilation',
    fn: objectCompiled,
  },
  // Compiled
  {
    name: 'object without JIT compilation memoized',
    fn: objectMemo,
  },
  {
    name: 'object with JIT compilation memoized',
    fn: objectCompiledMemo,
  },
]

const strictSuites = [
  // Non-compiled
  {
    name: 'objectStrict without JIT compilation',
    fn: objectStrict,
  },
  {
    name: 'objectStrict with JIT compilation',
    fn: objectStrictCompiled,
  },
  // Compiled
  {
    name: 'objectStrict without JIT compilation memoized',
    fn: objectStrictMemo,
  },
  {
    name: 'objectStrict with JIT compilation memoized',
    fn: objectStrictCompiledMemo,
  },
]

describe('object', () => {
  looseSuites.forEach(({ name: suiteName, fn: object }) => {
    describe(suiteName, () => {
      describe('objects', () => {
        describe('unknown properties', () => {
          it('excludes unknown properties', () => {
            const parseObj = object({
              expected: equals(true),
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
            expect(parseUser({ name: 'Alice' })).toHaveProperty(
              'tag',
              'failure',
            )
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
                  // @ts-expect-error -- required prop name must not be optional
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
                  // Object with optional properties is a superset of object with undefinable properties
                  name: parseString,
                })
              })
              it('must be optional', () => {
                object<User>({
                  name: optional(parseString),
                })
              })
            })
            describe('unknown properties', () => {
              test('unknown value types', () => {
                type User = {
                  data: unknown
                }
                const parseUser = object<User>({
                  data: parseUnknown,
                })
                const t1: Equals<
                  Infer<typeof parseUser>,
                  { data: unknown }
                > = true
              })
              test('optional unknown value types', () => {
                type User = {
                  data?: unknown
                }
                const parseUser = object<User>({
                  data: optional(parseUnknown),
                })
                const t1: Equals<
                  Infer<typeof parseUser>,
                  { data?: unknown }
                > = true
              })
            })
          })
          describe('type inference', () => {
            test('non-unknown', () => {
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
          test('unknown value types', () => {
            const parseUser = object({
              data: parseUnknown,
            })
            const t1: Equals<Infer<typeof parseUser>, { data: unknown }> = true
          })
          test('optional unknown value types', () => {
            const parseUser = object({
              data: optional(parseUnknown),
            })
            // @ts-expect-error -- cannot make unknown optional due to a compromise between API ergonomy and type safety
            const t1: Equals<Infer<typeof parseUser>, { data?: unknown }> = true
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
            expect(
              parseUser({ id: 1, email: 'alice@test.com' }),
            ).toHaveProperty('tag', 'success')
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
            // Just to show that toEqual lies about absent properties!
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
          describe('unknown properties', () => {
            test('required unknown properties', () => {
              const parse = object({
                email: parseUnknown,
              })
              expect(parse({})).toHaveProperty('tag', 'failure')
              expect(
                parse({
                  email: undefined,
                }),
              ).toHaveProperty('tag', 'success')
              expect(
                parse({
                  email: '',
                }),
              ).toHaveProperty('tag', 'success')
            })
            test('optional unknown properties', () => {
              const parse = object({
                email: optional(parseUnknown),
              })
              expect(parse({})).toHaveProperty('tag', 'success')
              expect(
                parse({
                  email: undefined,
                }),
              ).toHaveProperty('tag', 'success')
              expect(
                parse({
                  email: '',
                }),
              ).toHaveProperty('tag', 'success')
            })
          })
          describe('type inference', () => {
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
                // @ts-expect-error `omitProperty` is not included in the inferred type
                id: omitProperty,
              }
            })
            test('optional properties inference', () => {
              type User = {
                email?: string
              }
              const parseUser = object({
                email: optional(parseString),
              })
              type InferredUser = Infer<typeof parseUser>
              const t1: Equals<InferredUser, User> = true
              const a1: InferredUser = {
                email: '',
              }
              const a2: InferredUser = {
                email: undefined,
              }
              const a3: InferredUser = {}

              const a4: InferredUser = {
                // @ts-expect-error `omitProperty` is not included in the inferred type
                email: omitProperty,
              }
            })
            it('differentiates between undefined and missing properties', () => {
              const parseOptional = object({
                email: optional(parseString),
              })
              const tOptional0: Equals<
                Infer<typeof parseOptional>,
                {
                  email?: string
                }
              > = true
              const tOptional01: Equals<
                Infer<typeof parseOptional>,
                {
                  email: string | undefined
                }
              > = false

              const parseUndefinable = object({
                email: undefineable(parseString),
              })
              const tReq0: Equals<
                Infer<typeof parseUndefinable>,
                {
                  email?: string
                }
              > = false
              const tReq1: Equals<
                Infer<typeof parseUndefinable>,
                {
                  email: string | undefined
                }
              > = true
            })
            test('mix of required and optional properties', () => {
              type User = {
                id: number
                email?: string
              }
              const parseUser = object({
                id: parseNumber,
                email: optional(parseString),
              })
              type InferredUser = Infer<typeof parseUser>
              const t1: Equals<InferredUser, User> = true
              // @ts-expect-error -- the id property is required
              const a0: InferredUser = {
                email: '',
              }
              const a1: InferredUser = {
                id: 123,
                email: '',
              }
              const a2: InferredUser = {
                id: 123,
                email: undefined,
              }
              const a3: InferredUser = {
                id: 123,
              }

              const a4: InferredUser = {
                id: 123,
                // @ts-expect-error `omitProperty` is not included in the inferred type
                email: omitProperty,
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
              email: optional(withDefault(parseString, defaultEmail)),
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
            expect(Object.assign({}, result.value)).not.toHaveProperty(
              'isAdmin',
            )
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
                error: expect.objectContaining({
                  path: [],
                }),
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
                error: expect.objectContaining({
                  path: [
                    {
                      tag: 'object',
                      key: 'a',
                    },
                  ],
                }),
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
                  error: expect.objectContaining({
                    path: [
                      {
                        tag: 'object',
                        key: 'a',
                      },
                    ],
                  }),
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
                  error: expect.objectContaining({
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
                }),
              )
            })
          })
        })
        describe('types', () => {
          test('that the return type is the same for explicit and inferred types', () => {
            type OptionalUser = {
              id: number
              email?: string
            }
            const exp1 = object<OptionalUser>({
              id: parseNumber,
              email: optional(parseString),
            })

            const inf1 = object({
              id: parseNumber,
              email: optional(parseString),
            })

            const t1: Equals<typeof exp1, typeof inf1> = true

            type RequiredUser = {
              id: number
              email: string | undefined
            }
            const exp2 = object<RequiredUser>({
              id: parseNumber,
              email: parseString,
            })
            const inf2 = object({
              id: parseNumber,
              email: undefineable(parseString),
            })

            const t2: Equals<typeof exp2, typeof inf2> = true
          })
        })
      })
    })
    it('handles generic parsers', () => {
      type Node<T> = { data: T }
      const node = <T>(parser: Parser<T>, d: T): Parser<Node<T>> =>
        // @ts-expect-error -- TODO should not give an error
        object({
          data: parser,
        })
      const parseNode = node(parseString, '')
      const n: Infer<typeof parseNode> = {
        data: 'a',
      }
    })
  })

  describe('objectStrict', () => {
    strictSuites.forEach(({ name: suiteName, fn: objectStrict }) => {
      describe(suiteName, () => {
        it('invalidates non-object data', () => {
          ;[
            1,
            'a',
            null,
            undefined,
            () => undefined,
            false,
            true,
            1n,
            Symbol(),
          ].forEach((data) => {
            expect(objectStrict({})(data)).toEqual(
              expect.objectContaining({ tag: 'failure' }),
            )
          })
        })
        it('validates empty objects', () => {
          expect(objectStrict({})({})).toEqual(
            expect.objectContaining({ tag: 'success' }),
          )
        })
        it('validates objects with properties', () => {
          expect(objectStrict({ a: parseString })({ a: 'a' })).toEqual(
            expect.objectContaining({ tag: 'success' }),
          )
          expect(objectStrict({ a: parseNumber })({ a: 123 })).toEqual(
            expect.objectContaining({ tag: 'success' }),
          )
          expect(
            objectStrict({ a: parseString, b: parseBoolean })({
              a: 'a',
              b: false,
            }),
          ).toEqual(expect.objectContaining({ tag: 'success' }))
        })
        it('invalidates objects with undeclared properties', () => {
          expect(objectStrict({})({ a: 'a' })).toEqual(
            expect.objectContaining({ tag: 'failure' }),
          )
          expect(objectStrict({ a: parseString })({ b: 'b' })).toEqual(
            expect.objectContaining({ tag: 'failure' }),
          )
        })
        it('invalidates objects with missing properties', () => {
          expect(
            objectStrict({ a: parseString, b: parseBoolean })({ a: 'a' }),
          ).toEqual(expect.objectContaining({ tag: 'failure' }))
          expect(objectStrict({ a: parseString })({ b: 'b' })).toEqual(
            expect.objectContaining({ tag: 'failure' }),
          )
        })
        describe('optional properties', () => {
          it('validates objects with omitted optional properties', () => {
            expect(
              objectStrict({
                a: optional(parseString),
              })({}),
            ).toEqual(expect.objectContaining({ tag: 'success' }))
          })
          it('validates objects with present optional properties', () => {
            expect(
              objectStrict({
                a: optional(parseString),
              })({ a: 'a' }),
            ).toEqual(expect.objectContaining({ tag: 'success' }))
          })
          it('invalidates objects with omitted optional properties and undeclared properties', () => {
            expect(
              objectStrict({
                a: optional(parseString),
              })({ b: '' }),
            ).toEqual(expect.objectContaining({ tag: 'failure' }))
          })
        })
      })
    })
  })
})
