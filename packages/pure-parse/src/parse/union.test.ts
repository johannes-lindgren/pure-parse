import { describe, expect, it } from 'vitest'
import { parseNumber, parseString } from './primitives'
import {
  nullable,
  optional,
  optionalNullable,
  undefineable,
  union,
} from './union'
import { object } from './object'
import { fallback } from './fallback'
import { literal } from './literal'

describe('unions', () => {
  describe('optional', () => {
    it('works with fallbacks', () => {
      const parseName = optional(fallback(parseString, 'anonymous'))
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
      const parseName = nullable(fallback(parseString, 'anonymous'))
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
      const parseName = undefineable(fallback(parseString, 'anonymous'))
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
      const parseName = optionalNullable(fallback(parseString, 'anonymous'))
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
})
