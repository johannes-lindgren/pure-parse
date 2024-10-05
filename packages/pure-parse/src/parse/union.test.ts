import { describe, expect, it } from 'vitest'
import { literal, parseNumber, parseString } from './primitives'
import {
  nullable,
  optional,
  optionalNullable,
  undefineable,
  union,
} from './union'
import { object } from './object'
import { fallback } from './fallback'

describe('unions', () => {
  describe('union', () => {
    describe('referential preservation', () => {
      it('should return the same reference', () => {
        const isNumberContent = object({
          type: literal('number'),
          value: parseNumber,
        })
        const isStringContent = object({
          type: literal('string'),
          value: parseString,
        })
        const parseContent = union(isNumberContent, isStringContent)

        /*
         Test first argument of union
         */
        const numberContent = {
          type: 'number',
          value: 123,
        }
        const resultNumber = parseContent(numberContent)
        if (resultNumber.tag !== 'success') {
          throw new Error('Expected success')
        }
        expect(resultNumber.value).toBe(numberContent)

        /*
         Test second argument of union
         */
        const stringContent = {
          type: 'string',
          value: 'hello',
        }
        const resultString = parseContent(stringContent)
        if (resultString.tag !== 'success') {
          throw new Error('Expected success')
        }
        expect(resultString.value).toBe(stringContent)
      })
    })
  })
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
