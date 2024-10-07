import { describe, expect, it } from 'vitest'
import { isJsonValue, parseJson } from './json'
import { object } from './validation'
import { isNumber, isString, isUnknown } from './guards'

describe('json', () => {
  describe('validation', () => {
    it('is null', () => {
      expect(isJsonValue(JSON.stringify('hello'))).toEqual(true)
    })
    it('is boolean', () => {
      expect(isJsonValue(JSON.stringify(false))).toEqual(true)
      expect(isJsonValue(JSON.stringify(true))).toEqual(true)
    })
    it('is number', () => {
      expect(isJsonValue(JSON.stringify(123))).toEqual(true)
    })
    it('is string', () => {
      expect(isJsonValue(JSON.stringify('hello'))).toEqual(true)
    })
    it('is array of primitives', () => {
      expect(isJsonValue(JSON.stringify([1, 2, 3, 4]))).toEqual(true)
      expect(isJsonValue(JSON.stringify([1, 'a', false]))).toEqual(true)
    })
    it('is dictionary of primitives', () => {
      expect(isJsonValue(JSON.stringify({ a: 1, b: 2 }))).toEqual(true)
      expect(isJsonValue(JSON.stringify({ a: 1, b: 'B', c: false }))).toEqual(
        true,
      )
    })
    it('is recursive array', () => {
      expect(isJsonValue(JSON.stringify([[[[]]]]))).toEqual(true)
      expect(isJsonValue(JSON.stringify([[], [], []]))).toEqual(true)
      expect(
        isJsonValue(JSON.stringify([1, [2, 3, 4], ['a', 'b'], ['c', ['d']]])),
      ).toEqual(true)
    })
    it('is recursive object', () => {
      expect(isJsonValue(JSON.stringify({ a: { a: { a: {} } } }))).toEqual(true)
      expect(
        isJsonValue(JSON.stringify({ a: 1, b: { c: { d: 'hello' } } })),
      ).toEqual(true)
    })
    it('is recursive arrays and objects', () => {
      expect(isJsonValue(JSON.stringify([{ a: [{ b: [] }] }]))).toEqual(true)
    })
  })
  describe('parseJson', () => {
    it('does not throw errors', () => {
      expect(() => parseJson(isUnknown)('not a json!')).not.toThrow()
    })
    it('returns an error if the parsing failed', () => {
      expect(parseJson(isUnknown)('not a json!')).toBeInstanceOf(Error)
    })
    it('returns an error if the validation failed', () => {
      expect(parseJson(isString)('{}')).toBeInstanceOf(Error)
    })
    it('returns the object if the validation succeeded', () => {
      expect(parseJson(isString)(JSON.stringify('abc'))).toEqual('abc')
      expect(parseJson(isNumber)(JSON.stringify(123))).toEqual(123)
      expect(
        parseJson(object({ a: isNumber }))(JSON.stringify({ a: 1 })),
      ).toEqual({ a: 1 })
    })
  })
})
