import { describe, it, test } from 'vitest'
import { Equals } from './Equals.test'

describe('Equals', () => {
  test('primitives', () => {
    const a1: Equals<string, string> = true
    const a2: Equals<string, number> = false
    const a3: Equals<null, undefined> = false
  })
  test('objects', () => {
    const a1: Equals<{}, {}> = true
    const a2: Equals<{ a: string }, { a: string }> = true
    const a3: Equals<{ a: string }, { a: number }> = false
    const a4: Equals<{ a: string }, {}> = false
    const a5: Equals<{}, { a: string }> = false
  })
  test('tuples', () => {
    const a0: Equals<[], []> = true
    const a2: Equals<[number, number], [number, number]> = true
    const a3: Equals<[number], [number, number]> = false
    const a4: Equals<[number, number], [number]> = false
  })
  test('arrays', () => {
    const a0: Equals<[], []> = true
    const a1: Equals<string[], []> = false
    const a2: Equals<(string | number)[], (string | number)[]> = true
    const a3: Equals<(string | number)[], string[]> = false
    const a4: Equals<string[], (string | number)[]> = false
  })
})
