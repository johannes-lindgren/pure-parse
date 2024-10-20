import { describe, expect, it } from 'vitest'
import { nullable, optional, optionalNullable, undefineable } from './optional'
import { withDefault } from './fallback'
import { parseString } from './primitives'

describe('optional', () => {
  it('works with fallbacks', () => {
    const parseName = optional(withDefault(parseString, 'anonymous'))
    expect(parseName('Johannes')).toEqual(
      expect.objectContaining({
        value: 'Johannes',
      }),
    )
    expect(parseName(undefined)).toEqual(
      expect.objectContaining({
        value: undefined,
      }),
    )
    expect(parseName(123)).toEqual(
      expect.objectContaining({
        value: 'anonymous',
      }),
    )
  })
})
describe('nullable', () => {
  it('works with fallbacks', () => {
    const parseName = nullable(withDefault(parseString, 'anonymous'))
    expect(parseName('Johannes')).toEqual(
      expect.objectContaining({
        value: 'Johannes',
      }),
    )
    expect(parseName(null)).toEqual(
      expect.objectContaining({
        value: null,
      }),
    )
    expect(parseName(123)).toEqual(
      expect.objectContaining({
        value: 'anonymous',
      }),
    )
  })
})
describe('undefinable', () => {
  it('works with fallbacks', () => {
    const parseName = undefineable(withDefault(parseString, 'anonymous'))
    expect(parseName('Johannes')).toEqual(
      expect.objectContaining({
        value: 'Johannes',
      }),
    )
    expect(parseName(undefined)).toEqual(
      expect.objectContaining({
        value: undefined,
      }),
    )
    expect(parseName(123)).toEqual(
      expect.objectContaining({
        value: 'anonymous',
      }),
    )
  })
})
describe('optionalNullable', () => {
  it('works with fallbacks', () => {
    const parseName = optionalNullable(withDefault(parseString, 'anonymous'))
    expect(parseName('Johannes')).toEqual(
      expect.objectContaining({
        value: 'Johannes',
      }),
    )
    expect(parseName(null)).toEqual(
      expect.objectContaining({
        value: null,
      }),
    )
    expect(parseName(undefined)).toEqual(
      expect.objectContaining({
        value: undefined,
      }),
    )
    expect(parseName(123)).toEqual(
      expect.objectContaining({
        value: 'anonymous',
      }),
    )
  })
})
