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
  successFallback,
  success,
  failure,
  nullable,
} from './parse'
import { type Equals } from './Equals.test'

describe('parsing', () => {
  describe('fallback', () => {
    test.todo('on success')
    test.todo('on validation failure')
    test.todo('on fallback')
    test.todo('on optional properties')
    test.todo('fallback on fallback')
  })
  describe('literals', () => {
    it('todo', () => {
      const parseLiteral = literal('a')
      expect(parseLiteral('a')).toEqual({
        tag: 'success',
        isSuccess: true,
        value: 'a',
      })
    })
    test('with fallback', () => {
      const parseLiteral = fallback(literal('#FF0000'), '#00FF00')
      expect(parseLiteral('#XXYYZZ')).toEqual({
        tag: 'success-fallback',
        isSuccess: true,
        value: '#00FF00',
      })
    })
  })
  describe('unions', () => {
    it('todo', () => {
      const color = union(literal('red'), literal('green'), literal('blue'))
      expect(color('red')).toEqual({
        tag: 'success',
        isSuccess: true,
        value: 'red',
      })
      expect(color('green')).toEqual({
        tag: 'success',
        isSuccess: true,
        value: 'green',
      })
      expect(color('blue')).toEqual({
        tag: 'success',
        isSuccess: true,
        value: 'blue',
      })
      expect(color('yellow')).toHaveProperty('tag', 'failure')
    })
  })
  describe.todo('nullable')
  describe.todo('undefinable')
  describe('arrays', () => {
    it('todo', () => {
      const parseArr = array(literal('a'))
      expect(parseArr(['a', 'a'])).toEqual({
        tag: 'success',
        isSuccess: true,
        value: ['a', 'a'],
      })
      expect(parseArr(['a', 'b'])).toHaveProperty('tag', 'failure')
    })
    test('with fallback', () => {
      const parseArr = array(fallback(literal('#FF0000'), '#00FF00'))
      expect(parseArr(['#FF0000', '#FF0000'])).toEqual({
        tag: 'success',
        isSuccess: true,
        value: ['#FF0000', '#FF0000'],
      })
      expect(parseArr(['#FF0000', '#XXYYZZ'])).toEqual({
        tag: 'success',
        isSuccess: true,
        value: ['#FF0000', '#00FF00'],
      })
      expect(parseArr(['#XXYYZZ', '#XXYYZZ'])).toEqual({
        tag: 'success',
        isSuccess: true,
        value: ['#00FF00', '#00FF00'],
      })
      expect(parseArr(['#FF0000', '#XXYYZZ', '#FF0000', '#XXYYZZ'])).toEqual({
        tag: 'success',
        isSuccess: true,
        value: ['#FF0000', '#00FF00', '#FF0000', '#00FF00'],
      })
    })
    test('that the result type is infallible', () => {
      const res = fallback(parseString, '')(123)
      const a1: typeof res = success('')
      const a2: typeof res = successFallback('')
      // @ts-expect-error -- fallback result is infallible
      const a3: typeof res = failure('')
    })
  })
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
        expect(parseUser({ id: 1 })).toHaveProperty('tag', 'success')
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
      test('parsing', () => {
        const parseUser = object({
          id: parseNumber,
          email: optional(parseString),
        })
        expect(parseUser({ id: 1 })).toHaveProperty('tag', 'success')
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
            // @ts-expect-error -- parser must be optional
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
        expect(parseUser({ id: 1, name: 'Alice' })).toEqual({
          tag: 'success',
          isSuccess: true,
          value: { id: 1, name: 'Alice' },
        })

        // The email can be a string -> Success
        expect(
          parseUser({ id: 1, name: 'Alice', email: 'alice@test.com' }),
        ).toEqual({
          tag: 'success',
          isSuccess: true,
          value: { id: 1, name: 'Alice', email: 'alice@test.com' },
        })

        // The email can't be a number -> falls back
        expect(parseUser({ id: 1, name: 'Alice', email: 123 })).toEqual({
          tag: 'success',
          isSuccess: true,
          value: { id: 1, name: 'Alice', email: defaultEmail },
        })
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
        ).toEqual({
          tag: 'success',
          isSuccess: true,
          value: { id: 1, name: 'Alice', email: 'alice@test.com' },
        })

        // number fails -> Falls back
        expect(parseUser({ id: 1, name: 'Alice', email: 123 })).toEqual({
          tag: 'success',
          isSuccess: true,
          value: { id: 1, name: 'Alice', email: defaultEmail },
        })

        // The property is required -> Fails
        expect(parseUser({ id: 1, name: 'Alice' })).toHaveProperty(
          'tag',
          'failure',
        )
      })
    })
  })
  test('with a larger, realistic example', () => {
    type StringContent = {
      tag: 'string'
      value: string
    }
    type NumberContent = {
      tag: 'number'
      value: number
    }
    type UnknownContent = {
      tag: 'unknown'
    }
    type Content = StringContent | NumberContent | UnknownContent
    type Document = {
      title: string
      description?: string
      content: Content[]
    }
    const data: unknown = {
      title: 'My document',
      content: [
        { tag: 'string', value: 'day 1' },
        { tag: 'string', value: 'day 2' },
        // Note that this has a type mismatch error
        { tag: 'string', value: 3 },
        { tag: 'number', value: 4 },
      ],
    }
    const parseStringContent = object<StringContent>({
      tag: literal('string'),
      value: parseString,
    })
    const parseNumberContent = object<NumberContent>({
      tag: literal('number'),
      value: parseNumber,
    })
    const parseUnknownContent = object<UnknownContent>({
      tag: literal('unknown'),
    })
    const parseContent = union<[StringContent, NumberContent, UnknownContent]>(
      parseStringContent,
      parseNumberContent,
      parseUnknownContent,
    )
    const parseDocument = object<Document>({
      title: parseString,
      description: optional(parseString),
      content: array(fallback(parseContent, { tag: 'unknown' })),
    })
  })
})
