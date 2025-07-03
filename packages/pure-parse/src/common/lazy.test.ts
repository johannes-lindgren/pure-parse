import { describe, expect, it, test, vi } from 'vitest'
import { lazy } from './lazy'
import { Equals } from '../internals'
import { object, optional, Parser, parseString, success } from '../parsers'

describe('lazy', () => {
  it('only constructs the function once (memoization)', () => {
    const construct = vi.fn(() => () => 42)
    const fn = lazy(construct)
    fn()
    fn()
    expect(construct).toHaveBeenCalledTimes(1)
  })
  it('lets you call the wrapped function normally', () => {
    const construct = vi.fn(() => (num: number) => num ** 3)
    const fn = lazy(construct)
    // Evaluation check
    expect(fn(3.14)).toBe(3.14 ** 3)
  })
  test('type inference', () => {
    const fn1 = lazy(() => () => 42)
    const t1: Equals<typeof fn1, () => number> = true

    const fn2 = lazy(() => (num: number) => num.toString())
    const t2: Equals<typeof fn2, (num: number) => string> = true

    const fn3 = lazy(() => (base: number, exp: number) => base ** exp)
    const t3: Equals<typeof fn3, (base: number, exp: number) => number> = true
  })
  it('supports direct recursive parsers', () => {
    type Person = {
      name: string
      mother?: Person
      father?: Person
    }
    const parsePerson: Parser<Person> = lazy(() =>
      object({
        name: parseString,
        mother: optional(parsePerson),
        father: optional(parsePerson),
      }),
    )

    // Test that it works in runtime, even though it is the types that matter
    const person1: Person = {
      name: 'Johannes',
    }
    expect(parsePerson(person1)).toEqual(success(person1))

    const person2: Person = {
      name: 'Bob',
      mother: {
        name: 'Alice',
      },
      father: {
        name: 'Evan',
      },
    }
    expect(parsePerson(person2)).toEqual(success(person2))

    const person3: Person = {
      name: 'Charlie',
      mother: {
        name: 'Diana',
        mother: {
          name: 'Diana',
        },
        father: {
          name: 'Evan',
        },
      },
      father: {
        name: 'Johan',
        mother: {
          name: 'Alice',
        },
        father: {
          name: 'Frank',
        },
      },
    }
    expect(parsePerson(person3)).toEqual(success(person3))

    // Failure cases
    const person4 = {
      name: 'A',
      mother: {
        name: 'B',
        father: {}, // Missing required field 'name'
      },
    }
    expect(parsePerson(person4)).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
  })
  it('supports indirect recursive parsers', () => {
    type Family = {
      mother: Person
      father: Person
    }
    type Person = {
      family?: Family
    }
    const parsePerson: Parser<Person> = lazy(() =>
      object({
        family: optional(parseFamily),
      }),
    )
    const parseFamily: Parser<Family> = lazy(() =>
      object({
        mother: parsePerson,
        father: parsePerson,
      }),
    )

    // Test that it works in runtime, even though it is the types that matter
    const person1: Person = {}
    expect(parsePerson(person1)).toEqual(success(person1))

    const person2: Person = {
      family: {
        mother: {},
        father: {},
      },
    }
    expect(parsePerson(person2)).toEqual(success(person2))

    const person3: Person = {
      family: {
        mother: {
          family: {
            mother: {},
            father: {},
          },
        },
        father: {
          family: {
            mother: {},
            father: {},
          },
        },
      },
    }
    expect(parsePerson(person3)).toEqual(success(person3))

    // Failure cases
    const person4 = {
      family: {},
    }
    expect(parsePerson(person4)).toEqual(
      expect.objectContaining({
        tag: 'failure',
      }),
    )
  })
})
