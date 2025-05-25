import { describe, expect, it, test, vi } from 'vitest'
import { tuple } from './tuples'
import { parseNumber, parseString } from './primitives'
import { Equals } from '../internals'
import { Parser } from './Parser'

const parseVec2 = tuple([parseNumber, parseNumber])

describe('tuples', () => {
  describe('types', () => {
    test('type inference', () => {
      const parserA = tuple([parseString, parseNumber])
      const a1: Equals<typeof parserA, Parser<[string, number]>> = true
      const a2: Equals<typeof parserA, Parser<[string]>> = false
      const a3: Equals<typeof parserA, Parser<[string, string]>> = false

      const parserB = tuple([
        parseString,
        parseNumber,
        tuple([parseNumber, parseNumber]),
      ])
      const b1: Equals<
        typeof parserB,
        Parser<[string, number, [number, number]]>
      > = true
      const b2: Equals<typeof parserB, Parser<[string, number]>> = false
    })
    test('explicit type annotation', () => {
      const parser1 = tuple<[string, number]>([parseString, parseNumber])

      // @ts-expect-error type arguments don't match function arguments
      const parser2 = tuple<[string, number]>([parseNumber, parseNumber])
    })
  })
  it('validates that the data is an array', () => {
    expect(parseVec2(1)).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
    expect(parseVec2({ a: 1 })).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
  })
  it('validates empty tuples', () => {
    const parse = tuple([])
    expect(parse([])).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
  })
  it('invalidates data of lesser lengths', () => {
    expect(parseVec2([1])).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
    expect(parseVec2([1, 2])).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
  })
  it('validates data of the exact same length', () => {
    expect(parseVec2([1, 2])).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
  })
  it('discards data that is out of bounds', () => {
    expect(parseVec2([1, 2, 3])).toEqual(
      expect.objectContaining({
        tag: 'success',
        value: [1, 2],
      }),
    )
  })
  it('validates that all elements match corresponding parser', () => {
    const parse1 = tuple([parseNumber, parseString])
    // Check index 0
    expect(parse1([1, 'a'])).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
    expect(parse1(['a', 'b'])).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
    // Check index 1
    expect(parse1([1, 'a'])).toEqual(
      expect.objectContaining({
        tag: 'success',
      }),
    )
    expect(parse1([1, 1])).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
  })
  it('skips invocation of parsers if preceeding parsing attempts fail', () => {
    const a = vi.fn(parseNumber)
    const b = vi.fn(parseNumber)
    const parse = tuple([a, b])
    parse(['a', 'b'])
    expect(a).toHaveBeenCalled()
    expect(b).not.toHaveBeenCalled()
  })

  describe('errors', () => {
    it('reports non-arrays', () => {
      const parse = tuple([parseString])
      expect(parse(1)).toEqual(
        expect.objectContaining({
          tag: 'failure',
          path: [],
        }),
      )
    })
    describe('nested errors', () => {
      it('reports shallow errors in elements', () => {
        const parse = tuple([parseString])
        expect(parse([1])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            path: [{ tag: 'array', index: 0 }],
          }),
        )
      })
      it('reports deep errors in nested elements', () => {
        const parse = tuple([
          tuple([parseString, parseString]),
          tuple([parseString, parseString]),
        ])
        expect(
          parse([
            [1, 1],
            [1, 1],
          ]),
        ).toEqual(
          expect.objectContaining({
            tag: 'failure',
            path: [
              { tag: 'array', index: 0 },
              { tag: 'array', index: 0 },
            ],
          }),
        )
        expect(
          parse([
            ['1', 1],
            [1, 1],
          ]),
        ).toEqual(
          expect.objectContaining({
            tag: 'failure',
            path: [
              { tag: 'array', index: 0 },
              { tag: 'array', index: 1 },
            ],
          }),
        )
        expect(
          parse([
            ['1', '1'],
            ['1', 1],
          ]),
        ).toEqual(
          expect.objectContaining({
            tag: 'failure',
            path: [
              { tag: 'array', index: 1 },
              { tag: 'array', index: 1 },
            ],
          }),
        )
      })
      test('that the index is accurate', () => {
        const parse = tuple([parseString, parseString, parseString])
        expect(parse([1, 2, 3])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            path: [{ tag: 'array', index: 0 }],
          }),
        )
        expect(parse(['1', 2, 3])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            path: [{ tag: 'array', index: 1 }],
          }),
        )
        expect(parse(['1', '2', 3])).toEqual(
          expect.objectContaining({
            tag: 'failure',
            path: [{ tag: 'array', index: 2 }],
          }),
        )
      })
    })
  })
})
