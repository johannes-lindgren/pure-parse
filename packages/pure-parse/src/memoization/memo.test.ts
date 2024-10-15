import { describe, expect, it, test, vi } from 'vitest'
import { memo, memoizeValidatorConstructor } from './memo'
import { parseNumber, parseString, object, array, optional } from '../parse'
import { isNumber, isString, objectGuard } from '../guard'

describe('memoization', () => {
  describe('memo', () => {
    it('memoizes parsers', () => {
      const data = {
        id: 123,
        name: 'Robert',
      }
      const parseUser = memo(
        object({
          id: parseNumber,
          name: parseString,
        }),
      )
      const result1 = parseUser(data)
      const result2 = parseUser(data)
      expect(result1).toBe(result2)
    })
    it('does not hit the cache when the reference is different', () => {
      const data1 = {
        id: 123,
        name: 'Robert',
      }
      const data2 = structuredClone(data1)
      const parseUser = memo(
        object({
          id: parseNumber,
          name: parseString,
        }),
      )
      const result1 = parseUser(data1)
      const result2 = parseUser(data2)
      expect(result1).not.toBe(result2)
    })
    it('memoizes validators', () => {
      const data = {
        id: 123,
        name: 'Robert',
      }
      const isUser = memo(
        objectGuard({
          id: isNumber,
          name: isString,
        }),
      )
      const result1 = isUser(data)
      const result2 = isUser(data)
      expect(result1).toBe(result2)
    })
    it('only calls the function once per input', () => {
      const data1 = {
        id: 123,
        name: 'Robert',
      }
      const isUser = objectGuard({
        id: isNumber,
        name: isString,
      })
      const isUserFn = vi.fn(isUser)
      const isUserMemoized = memo(isUserFn)
      const result1 = isUserMemoized(data1)
      const result2 = isUserMemoized(data1)
      expect(isUserFn).toHaveBeenCalledTimes(1)
      const data2 = {
        id: 123,
        name: 'Rolf',
      }
      const result3 = isUserMemoized(data2)
      const result4 = isUserMemoized(data1)
      expect(isUserFn).toHaveBeenCalledTimes(2)
    })
    it('memoizes nested validators', () => {
      const parseUser = vi.fn(
        object({
          id: parseNumber,
          name: parseString,
        }),
      )
      const parseUsers = memo(array(memo(parseUser)))
      const alice = { id: 1, name: 'Alice' }
      const bob = { id: 2, name: 'Bob' }
      const users = [alice, bob]
      parseUsers(users)
      parseUsers(users)
      expect(parseUser).toHaveBeenCalledTimes(2)
      parseUsers([alice, bob])
      expect(parseUser).toHaveBeenCalledTimes(2)
      parseUsers([alice, { id: 3, name: 'Charlie' }])
      expect(parseUser).toHaveBeenCalledTimes(3)
    })

    test('that you can wrap primitive validators in memo, even though memoization does not occur', () => {
      const primitiveGuard = vi.fn(isString)
      const memoizedPrimitiveGuard = memo(primitiveGuard)
      memoizedPrimitiveGuard('hello')
      memoizedPrimitiveGuard('hello')
      expect(primitiveGuard).toHaveBeenCalledTimes(2)
    })

    describe('optional properties', () => {
      type User = {
        id: number
        address?: {
          street: string
          city: string
        }
      }
      test('memoization of optional properties', () => {
        const parseUser = object({
          id: parseNumber,
          address: optional(
            object({
              street: parseString,
              city: parseString,
            }),
          ),
        })
        expect(
          parseUser({
            id: 1,
          }),
        ).toHaveProperty('tag', 'success')
        expect(
          parseUser({
            id: 1,
            address: {
              street: '123 Main St',
              city: 'Muggleridge',
            },
          }),
        ).toHaveProperty('tag', 'success')

        const parseUserMemo = object({
          id: parseNumber,
          address: memo(
            optional(
              object({
                street: parseString,
                city: parseString,
              }),
            ),
          ),
        })
        expect(
          parseUserMemo({
            id: 1,
          }),
        ).toHaveProperty('tag', 'success')
      })
      test('type declaration', () => {
        const parseUserMemo1 = object<User>({
          id: parseNumber,
          address: memo(
            optional(
              object({
                street: parseString,
                city: parseString,
              }),
            ),
          ),
        })

        const parseUserMemo2 = object<Required<User>>({
          id: parseNumber,
          // @ts-expect-error
          address: memo(
            optional(
              object({
                street: parseString,
                city: parseString,
              }),
            ),
          ),
        })
      })
    })
  })

  describe('memoizeValidatorConstructor', () => {
    it('memoizes parsers', () => {
      const data = {
        id: 123,
        name: 'Robert',
      }
      const objectMemo = memoizeValidatorConstructor(object)
      const parseUser = objectMemo({
        id: parseNumber,
        name: parseString,
      })
      const result1 = parseUser(data)
      const result2 = parseUser(data)
      expect(result1).toBe(result2)
    })
    it('does not hit the cache when the reference is different', () => {
      const data1 = {
        id: 123,
        name: 'Robert',
      }
      const data2 = structuredClone(data1)
      const objectMemo = memoizeValidatorConstructor(object)
      const parseUser = objectMemo({
        id: parseNumber,
        name: parseString,
      })
      const result1 = parseUser(data1)
      const result2 = parseUser(data2)
      expect(result1).not.toBe(result2)
    })
    it('does not memoize the parser constructor', () => {
      const objectFn = vi.fn(object)
      const objectMemo = vi.fn(memoizeValidatorConstructor(objectFn))
      const schema = {
        id: parseNumber,
        name: parseString,
      } as const
      const parseUser1 = objectMemo(schema)
      const parseUser2 = objectMemo(schema)
      const parseUser3 = objectMemo(schema)
      expect(objectMemo).toHaveBeenCalledTimes(3)
      expect(objectFn).toHaveBeenCalledTimes(3)
    })
  })
})
