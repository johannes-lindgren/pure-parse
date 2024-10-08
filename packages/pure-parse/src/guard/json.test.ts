import { describe, expect, it } from 'vitest'
import { isJsonValue } from './json'
import { object, isNumber, isString, isUnknown } from './index'

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
})
