import { describe, expect, it, test } from 'vitest'
import {
  array,
  literal,
  fallback,
  union,
  object,
  parseNumber,
  parseString,
  optional,
  Infer,
} from './parse'
import { type Equals } from './Equals.test'

describe('parsing', () => {
  describe('literals', () => {
    it('todo', () => {
      const parseLiteral = literal('a')
      expect(parseLiteral('a')).toEqual({ tag: 'success', value: 'a' })
    })
    test('with fallback', () => {
      const parseLiteral = fallback(literal('#FF0000'), '#00FF00')
      expect(parseLiteral('#XXYYZZ')).toEqual({
        tag: 'success',
        value: '#00FF00',
      })
    })
  })
  describe('unions', () => {
    it('todo', () => {
      const color = union(literal('red'), literal('green'), literal('blue'))
      expect(color('red')).toEqual({ tag: 'success', value: 'red' })
      expect(color('green')).toEqual({ tag: 'success', value: 'green' })
      expect(color('blue')).toEqual({ tag: 'success', value: 'blue' })
      expect(color('yellow')).toHaveProperty('tag', 'failure')
    })
  })
  describe('arrays', () => {
    it('todo', () => {
      const parseArr = array(literal('a'))
      expect(parseArr(['a', 'a'])).toEqual({
        tag: 'success',
        value: ['a', 'a'],
      })
      expect(parseArr(['a', 'b'])).toHaveProperty('tag', 'failure')
    })
    test('with fallback', () => {
      const parseArr = array(fallback(literal('#FF0000'), '#00FF00'))
      expect(parseArr(['#FF0000', '#FF0000'])).toEqual({
        tag: 'success',
        value: ['#FF0000', '#FF0000'],
      })
      expect(parseArr(['#FF0000', '#XXYYZZ'])).toEqual({
        tag: 'success',
        value: ['#FF0000', '#00FF00'],
      })
      expect(parseArr(['#XXYYZZ', '#XXYYZZ'])).toEqual({
        tag: 'success',
        value: ['#00FF00', '#00FF00'],
      })
      expect(parseArr(['#FF0000', '#XXYYZZ', '#FF0000', '#XXYYZZ'])).toEqual({
        tag: 'success',
        value: ['#FF0000', '#00FF00', '#FF0000', '#00FF00'],
      })
    })
  })
  describe('objects', () => {
    test('required properties', () => {
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
    test('optional properties', () => {
      const parseUser = object({
        id: parseNumber,
        name: parseString,
        email: optional(parseString),
      })
      expect(parseUser({ id: 1, name: 'Alice' })).toHaveProperty(
        'tag',
        'success',
      )
      expect(
        parseUser({ id: 1, name: 'Alice', email: 'alice@test.com' }),
      ).toHaveProperty('tag', 'success')
      expect(parseUser({ id: 1, name: 'Alice', email: 123 })).toHaveProperty(
        'tag',
        'failure',
      )
      expect(parseUser({ id: 1 })).toHaveProperty('tag', 'failure')
      expect(parseUser({ name: 'Alice' })).toHaveProperty('tag', 'failure')
      expect(parseUser({})).toHaveProperty('tag', 'failure')
    })
    test('with fallback', () => {
      const defaultEmail = 'default@test.com'
      const parseUser = object({
        id: parseNumber,
        name: parseString,
        email: fallback(parseString, defaultEmail),
      })

      // The property can be a string -> Success
      expect(
        parseUser({ id: 1, name: 'Alice', email: 'alice@test.com' }),
      ).toEqual({
        tag: 'success',
        value: { id: 1, name: 'Alice', email: 'alice@test.com' },
      })

      // number fails -> Falls back
      expect(parseUser({ id: 1, name: 'Alice', email: 123 })).toEqual({
        tag: 'success',
        value: { id: 1, name: 'Alice', email: defaultEmail },
      })

      // The property is required -> Fails
      expect(parseUser({ id: 1, name: 'Alice' })).toHaveProperty(
        'tag',
        'failure',
      )
    })
    test('with optional fallback', () => {
      const defaultEmail = 'default@test.com'
      const parseUser = object({
        id: parseNumber,
        name: parseString,
        email: optional(fallback(parseString, defaultEmail)),
      })
      // The email can be a omitted -> Success
      expect(parseUser({ id: 1, name: 'Alice' })).toEqual({
        tag: 'success',
        value: { id: 1, name: 'Alice' },
      })

      // The email can be a string -> Success
      expect(
        parseUser({ id: 1, name: 'Alice', email: 'alice@test.com' }),
      ).toEqual({
        tag: 'success',
        value: { id: 1, name: 'Alice', email: 'alice@test.com' },
      })

      // The email can't be a number -> falls back
      expect(parseUser({ id: 1, name: 'Alice', email: 123 })).toEqual({
        tag: 'success',
        value: { id: 1, name: 'Alice', email: defaultEmail },
      })
    })
    describe('type inference', () => {
      test('required properties', () => {
        type User = {
          id: number
          name: string
        }
        const parseUser = object({
          id: parseNumber,
          name: parseString,
        })
        const T1: Equals<Infer<typeof parseUser>, User> = true
      })
      test('optional properties', () => {
        type User = {
          id: number
          email?: string
        }
        const parseUser = object({
          id: parseNumber,
          email: optional(parseString),
        })
        type InferredUser = Infer<typeof parseUser>
        const T1: Equals<Infer<typeof parseUser>, User> = true
        const a1: InferredUser = {
          id: 123,
          email: '',
        }
        const a2: InferredUser = {
          id: 123,
        }
      })
    })
    describe('type annotation', () => {
      test('required properties', () => {
        type User = {
          id: number
          name: string
        }
        const parseUser1 = object<User>({
          id: parseNumber,
          name: parseString,
        })
        const parseUser2 = object<User>({
          id: parseNumber,
          // @ts-expect-error -- name must not be optional
          name: optional(parseString),
        })
        const parseUser3 = object<User>(
          // @ts-expect-error -- name must not be omitted
          {
            id: parseNumber,
          },
        )
      })
      test('optional properties', () => {
        type User = {
          id: number
          email?: string
        }
        const parseUser1 = object<User>({
          id: parseNumber,
          email: optional(parseString),
        })
        const parseUser2 = object<User>({
          id: parseNumber,
          // strings are assignable to optional strings
          email: parseString,
        })
        const parseUser3 = object<User>(
          // @ts-expect-error -- email parser must be present
          {
            id: parseNumber,
          },
        )
      })
    })
  })
})
