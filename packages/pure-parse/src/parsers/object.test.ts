import { describe, expect, it, test } from 'vitest'
import { object as objectParseEval, objectNoJit } from './object'
import { isSuccess, Parser } from './types'
import type { Equals } from '../internals'
import { union } from './union'
import {
  parseBoolean,
  parseNumber,
  parseString,
  parseUndefined,
} from './primitives'
import { fallback } from './fallback'
import { Infer } from '../common'
import { literal } from './literal'
import { nullable, optional } from './optional'

const suits = [
  {
    name: 'objectNoEval',
    fn: objectNoJit,
  },
  {
    name: 'objectEval',
    fn: objectParseEval,
  },
  //   TODO objectMemo
]

suits.forEach(({ name: suiteName, fn: object }) => {
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
        describe('type annotation', () => {
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
          const parseOptionalObj = object({
            a: optional(parseString),
          })
          expect(parseOptionalObj({})).toHaveProperty('tag', 'success')
          expect(parseOptionalObj({ a: undefined })).toHaveProperty(
            'tag',
            'success',
          )
          const parseUnionObj = object({
            a: union(parseString, parseUndefined),
          })
          expect(parseUnionObj({})).toHaveProperty('tag', 'failure')
          expect(parseUnionObj({ a: undefined })).toHaveProperty(
            'tag',
            'success',
          )
        })
        test('parsing', () => {
          const parseUser = object({
            id: parseNumber,
            email: optional(parseString),
          })
          expect(isSuccess(parseUser({ id: 1 }))).toEqual(true)
          expect(parseUser({ id: 1, email: undefined })).toHaveProperty(
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
        test('type inference', () => {
          type User = {
            id: number
            email?: string
          }
          const parseUser = object({
            id: parseNumber,
            email: optional(parseString),
          })
          type InferredUser = Infer<typeof parseUser>
          // @ts-expect-error -- TODO can't get this to work
          const T1: Equals<InferredUser, User> = true
          const a1: InferredUser = {
            id: 123,
            email: '',
          }
          const a2: InferredUser = {
            id: 123,
            email: undefined,
          }
          // @ts-expect-error -- TODO can't get this to work
          const a3: InferredUser = {
            id: 123,
          }
        })
      })
      describe('fallback', () => {
        test('optional fallback', () => {
          const defaultEmail = 'default@test.com'
          const parseUser = object({
            id: parseNumber,
            name: parseString,
            email: optional(fallback(parseString, defaultEmail)),
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
        test('required fallback', () => {
          const defaultEmail = 'default@test.com'
          const parseUser = object({
            id: parseNumber,
            name: parseString,
            email: fallback(parseString, defaultEmail),
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
            'failure',
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
        // Type inferrence of recusive types are impossible in TypeScript
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
    })
  })
})
