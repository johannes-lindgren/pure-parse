import { describe, expect, it, test } from 'vitest'
import { object } from './object'
import { fallback, Infer, isSuccess } from './parse'
import type { Equals } from '../internals'
import { nullable, optional } from './union'
import { parseNumber, parseString } from './primitives'

describe('objects', () => {
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
      expect(parseUser({ id: 1, email: null })).toHaveProperty('tag', 'success')
      expect(parseUser({ id: 1, email: 'alice@test.com' })).toHaveProperty(
        'tag',
        'success',
      )
      expect(parseUser({ id: 1, email: 123 })).toHaveProperty('tag', 'failure')
      expect(parseUser({ id: 1 })).toHaveProperty('tag', 'failure')
      expect(parseUser({})).toHaveProperty('tag', 'failure')
    })
  })
  describe('optional properties', () => {
    test('parsing', () => {
      const parseUser = object({
        id: parseNumber,
        // @ts-expect-error -- TODO make it possible to infer the type from optional parser
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
      expect(parseUser({ id: 1, email: 123 })).toHaveProperty('tag', 'failure')
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
        // @ts-expect-error -- can't wrap an optional with another optional
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
        // @ts-expect-error -- TODO make it possible to infer the type from optional parser
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
        // @ts-expect-error -- TODO make it possible to infer the type from optional parser
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
  describe('referential preservation', () => {
    describe('shallow object', () => {
      it('preserves reference when all properties are success', () => {
        const parseUser = object({
          id: parseNumber,
          name: parseString,
        })
        const user = { id: 1, name: 'Alice' }
        const result = parseUser(user)
        if (result.tag === 'success') {
          expect(result.value).toBe(user)
        } else {
          throw new Error('Expected success')
        }
      })
      it('preserves reference when a property is optional', () => {
        type User = {
          id: number
          name?: string
        }
        const parseUser = object<User>({
          id: parseNumber,
          name: optional(parseString),
        })
        const user = { id: 1, name: 'Alice' }
        const result = parseUser(user)
        if (result.tag === 'success') {
          expect(result.value).toBe(user)
        } else {
          throw new Error('Expected success')
        }
      })
      it('does not preserve reference when a property is fallback', () => {
        const parseUser = object({
          id: parseNumber,
          name: fallback(parseString, 'Anonymous'),
        })
        const user = { id: 1, name: 123 }
        const result = parseUser(user)
        if (result.tag === 'success-fallback') {
          expect(result.value).not.toBe(user)
        } else {
          throw new Error('Expected success')
        }
      })
    })
    describe('nested object', () => {
      it('preserves reference when all properties are success', () => {
        const parseUser = object({
          id: parseNumber,
          name: parseString,
          address: object({
            street: parseString,
            city: parseString,
          }),
        })
        const user = {
          id: 1,
          name: 'Alice',
          address: { street: '1st', city: 'NY' },
        }
        const result = parseUser(user)
        if (result.tag === 'success') {
          expect(result.value).toBe(user)
        } else {
          throw new Error('Expected success')
        }
      })
      it('does not preserve reference when a nested property fallback', () => {
        const parseUser = object({
          id: parseNumber,
          name: parseString,
          address: object({
            street: parseString,
            city: fallback(parseString, 'NY'),
          }),
        })
        const user = {
          id: 1,
          name: 'Alice',
          address: { street: '1st', city: 123 },
        }
        const result = parseUser(user)
        if (result.tag === 'success-fallback') {
          expect(result.value).not.toBe(user)
        } else {
          throw new Error('Expected success')
        }
      })
    })
  })
})
