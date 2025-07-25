import { describe, expect, it, test } from 'vitest'
import { array } from './arrays'
import { failure, success } from './ParseResult'
import { equals } from './equals'
import { parseString } from './primitives'
import { withDefault } from './withDefault'

describe('arrays', () => {
  it('validates when all elements pass validation', () => {
    const parseArr = array(equals('a'))
    expect(parseArr(['a', 'a'])).toEqual({
      tag: 'success',
      value: ['a', 'a'],
    })
  })
  it('invalidates when any elements pass validation', () => {
    const parseArr = array(equals('a'))
    expect(parseArr(['a', 'b'])).toHaveProperty('tag', 'failure')
  })
  test('with fallbackValue', () => {
    const parseArr = array(withDefault(equals('#FF0000'), '#00FF00'))
    expect(parseArr(['#FF0000', '#FF0000'])).toEqual(
      expect.objectContaining({
        value: ['#FF0000', '#FF0000'],
      }),
    )
    expect(parseArr(['#FF0000', '#XXYYZZ'])).toEqual(
      expect.objectContaining({
        value: ['#FF0000', '#00FF00'],
      }),
    )
    expect(parseArr(['#XXYYZZ', '#XXYYZZ'])).toEqual(
      expect.objectContaining({
        value: ['#00FF00', '#00FF00'],
      }),
    )
    expect(parseArr(['#FF0000', '#XXYYZZ', '#FF0000', '#XXYYZZ'])).toEqual(
      expect.objectContaining({
        value: ['#FF0000', '#00FF00', '#FF0000', '#00FF00'],
      }),
    )
  })
  describe('errors', () => {
    it('reports non-arrays', () => {
      const parse = array(parseString)
      expect(parse(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
          error: expect.objectContaining({
            path: [],
          }),
        }),
      )
    })
    describe('nested errors', () => {
      it('reports shallow errors in elements', () => {
        const parse = array(parseString)
        expect(parse([1])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [{ tag: 'array', index: 0 }],
            }),
          }),
        )
      })
      it('reports deep errors in nested elements', () => {
        const parse = array(array(parseString))
        expect(parse([[1]])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [
                { tag: 'array', index: 0 },
                { tag: 'array', index: 0 },
              ],
            }),
          }),
        )
        expect(parse([[], [], [1]])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [
                { tag: 'array', index: 2 },
                { tag: 'array', index: 0 },
              ],
            }),
          }),
        )
        expect(parse([[], ['a'], ['a', 'b', 'c', 3], []])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [
                { tag: 'array', index: 2 },
                { tag: 'array', index: 3 },
              ],
            }),
          }),
        )
      })
      test('that the index is accurate', () => {
        const parse = array(parseString)
        expect(parse([1, 2, 3])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [{ tag: 'array', index: 0 }],
            }),
          }),
        )
        expect(parse(['1', 2, 3])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [{ tag: 'array', index: 1 }],
            }),
          }),
        )
        expect(parse(['1', '2', 3])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            error: expect.objectContaining({
              path: [{ tag: 'array', index: 2 }],
            }),
          }),
        )
      })
    })
  })
})
