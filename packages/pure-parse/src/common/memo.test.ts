import { describe, expect, it, vi } from 'vitest'
import { memo } from './memo'
import { parseNumber, parseString, object } from '../parse'
import { isNumber, isString, object as objectGuard } from '../validate'

describe('arrays', () => {
  it('works with parsers', () => {
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
  it('works with validators', () => {
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
})
