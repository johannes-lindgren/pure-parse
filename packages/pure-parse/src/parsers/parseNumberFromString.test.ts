import { describe, expect, it, test } from 'vitest'
import { parseNumberFromString } from './parseNumberFromString'

const expectFailure = () =>
  expect.objectContaining({
    tag: 'failure',
  })

describe('numberFromString', () => {
  it('should parse natural numbers', () => {
    expect(parseNumberFromString('123')).toEqual({
      tag: 'success',
      value: 123,
    })
  })
  it('should parse integers', () => {
    expect(parseNumberFromString('123')).toEqual({
      tag: 'success',
      value: 123,
    })
    expect(parseNumberFromString('-123')).toEqual({
      tag: 'success',
      value: -123,
    })
  })
  it('should parse floating numbers', () => {
    const result = parseNumberFromString('1.5')
    const epsilon = 1e-3
    if (result.tag === 'failure') {
      throw new Error('Expected success')
    }
    expect(result.value).toBeLessThanOrEqual(1.5 + epsilon)
    expect(result.value).toBeGreaterThanOrEqual(1.5 - epsilon)
  })
  it('should not return infinity for large numbers', () => {
    const googolStr = `1${new Array(1000).fill(0).join('')}`
    expect(parseNumberFromString(googolStr)).toEqual(expectFailure())
  })
  it('should not return infinity for small numbers', () => {
    const googolStr = `-1${new Array(1000).fill(0).join('')}`
    expect(parseNumberFromString(googolStr)).toEqual(expectFailure())
  })
  it('parses binary values', () => {
    expect(parseNumberFromString('0b1')).toEqual({
      tag: 'success',
      value: 1,
    })
    expect(parseNumberFromString('0b00')).toEqual({
      tag: 'success',
      value: 0,
    })
    expect(parseNumberFromString('0b0')).toEqual({
      tag: 'success',
      value: 0,
    })
    expect(parseNumberFromString('0b10')).toEqual({
      tag: 'success',
      value: 2,
    })
  })
  it('parses hexadecimal values', () => {
    expect(parseNumberFromString('0xFF')).toEqual({
      tag: 'success',
      value: 255,
    })
    expect(parseNumberFromString('0x00')).toEqual({
      tag: 'success',
      value: 0,
    })
    expect(parseNumberFromString('0x0')).toEqual({
      tag: 'success',
      value: 0,
    })
    expect(parseNumberFromString('0x80')).toEqual({
      tag: 'success',
      value: 128,
    })
  })
  it('parses octal values', () => {
    expect(parseNumberFromString('0o755')).toEqual({
      tag: 'success',
      value: 493,
    })
    expect(parseNumberFromString('0o00')).toEqual({
      tag: 'success',
      value: 0,
    })
    expect(parseNumberFromString('0o0')).toEqual({
      tag: 'success',
      value: 0,
    })
  })
  describe('scientific notation', () => {
    it('parses scientific notation', () => {
      test('upper and lower case', () => {
        expect(parseNumberFromString('1e2')).toEqual({
          tag: 'success',
          value: 100,
        })
        expect(parseNumberFromString('1E2')).toEqual({
          tag: 'success',
          value: 100,
        })
        expect(parseNumberFromString('1e-2')).toEqual({
          tag: 'success',
          value: 0.01,
        })
        expect(parseNumberFromString('1E-2')).toEqual({
          tag: 'success',
          value: 0.01,
        })
      })
      test('positive exponent', () => {
        expect(parseNumberFromString('1e2')).toEqual({
          tag: 'success',
          value: 100,
        })
        expect(parseNumberFromString('1e+2')).toEqual({
          tag: 'success',
          value: 100,
        })
      })
      test('negative exponent', () => {
        expect(parseNumberFromString('1e-2')).toEqual({
          tag: 'success',
          value: 0.01,
        })
        expect(parseNumberFromString('1e-0')).toEqual({
          tag: 'success',
          value: 1,
        })
        expect(parseNumberFromString('1e+0')).toEqual({
          tag: 'success',
          value: 1,
        })
      })
      test('zero exponent', () => {
        expect(parseNumberFromString('1e0')).toEqual({
          tag: 'success',
          value: 1,
        })
        expect(parseNumberFromString('1E0')).toEqual({
          tag: 'success',
          value: 1,
        })
      })
      test('zero base', () => {
        expect(parseNumberFromString('0e0')).toEqual({
          tag: 'success',
          value: 0,
        })
        expect(parseNumberFromString('0E0')).toEqual({
          tag: 'success',
          value: 0,
        })
      })
      test('zero base with exponent', () => {
        expect(parseNumberFromString('0e2')).toEqual({
          tag: 'success',
          value: 0,
        })
        expect(parseNumberFromString('0E2')).toEqual({
          tag: 'success',
          value: 0,
        })
      })
      test('zero base with negative exponent', () => {
        expect(parseNumberFromString('0e-2')).toEqual({
          tag: 'success',
          value: 0,
        })
        expect(parseNumberFromString('0E-2')).toEqual({
          tag: 'success',
          value: 0,
        })
      })
      test('zero base with positive exponent', () => {
        expect(parseNumberFromString('0e+2')).toEqual({
          tag: 'success',
          value: 0,
        })
        expect(parseNumberFromString('0E+2')).toEqual({
          tag: 'success',
          value: 0,
        })
      })
      test('zero base with zero exponent', () => {
        expect(parseNumberFromString('0e0')).toEqual({
          tag: 'success',
          value: 0,
        })
        expect(parseNumberFromString('0E0')).toEqual({
          tag: 'success',
          value: 0,
        })
      })
      test('larger number in the exponent', () => {})
      test('larger number in the base', () => {
        expect(parseNumberFromString('20e0')).toEqual({
          tag: 'success',
          value: 20,
        })
      })
      test('decimals in the exponent', () => {
        expect(parseNumberFromString('1e0.2')).toEqual({
          tag: 'success',
          value: 1.5848931924611136,
        })
        expect(parseNumberFromString('1e-0.2')).toEqual({
          tag: 'success',
          value: 0.6309573444801932,
        })
        expect(parseNumberFromString('1e+0.2')).toEqual({
          tag: 'success',
          value: 1.5848931924611136,
        })
        expect(parseNumberFromString('1E0.2')).toEqual({
          tag: 'success',
          value: 1.5848931924611136,
        })
      })
      test('decimals in the base', () => {
        expect(parseNumberFromString('0.2e0')).toEqual({
          tag: 'success',
          value: 0.2,
        })
      })
      test('decimals in the base and exponent', () => {
        expect(parseNumberFromString('0.2e0.2')).toEqual({
          tag: 'success',
          value: 0.2,
        })
      })
    })
  })
  test('empty strings', () => {
    expect(parseNumberFromString('')).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
  })
  describe('malformatted numbers', () => {
    test('string with whitespace', () => {
      expect(parseNumberFromString(' ')).toEqual(expectFailure())
      expect(parseNumberFromString('\r')).toEqual(expectFailure())
      expect(parseNumberFromString('\n')).toEqual(expectFailure())
      expect(parseNumberFromString('\n\r ')).toEqual(expectFailure())
    })
    test('string with number and whitespace', () => {
      expect(parseNumberFromString('1 ')).toEqual(expectFailure())
      expect(parseNumberFromString(' 1')).toEqual(expectFailure())
      expect(parseNumberFromString(' 1 ')).toEqual(expectFailure())
      expect(parseNumberFromString('\r 1')).toEqual(expectFailure())
      expect(parseNumberFromString('\n 1')).toEqual(expectFailure())
      expect(parseNumberFromString('\n\r 1')).toEqual(expectFailure())
    })
    test('fractions', () => {
      expect(parseNumberFromString('1/2')).toEqual(expectFailure())
    })
    test('text followed by numbers', () => {
      expect(parseNumberFromString('hello123')).toEqual(expectFailure())
    })
    test('numbers followed by text', () => {
      expect(parseNumberFromString('123hello')).toEqual(expectFailure())
    })
    test('numbers in text', () => {
      expect(parseNumberFromString('hello123hello')).toEqual(expectFailure())
    })
    test('text', () => {
      expect(parseNumberFromString('hello')).toEqual(expectFailure())
    })
  })
})
