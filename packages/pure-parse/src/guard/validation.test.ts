import { describe, it, expect, test } from 'vitest'
import {
  array,
  partialRecord,
  objectGuard,
  objectGuardNoEval,
  union,
  literal,
  optional,
  tuple,
  nullable,
  optionalNullable,
  Guard,
  record,
  undefineable,
} from './validation'
import { Equals } from '../internals'
import {
  isBoolean,
  isNull,
  isNumber,
  isString,
  isUndefined,
  isUnknown,
} from './guards'
import { Infer } from '../common'

describe('literal types', () => {
  describe('type checking', () => {
    describe('type inference', () => {
      it('works with literals', () => {
        const symb = Symbol()
        literal(symb) satisfies Guard<typeof symb>
        literal('red') satisfies Guard<'red'>
        // @ts-expect-error
        literal('red') satisfies Guard<'green'>
        literal(1) satisfies Guard<1>
        // @ts-expect-error
        literal(1) satisfies Guard<2>
      })
      it('forbids non-literals', () => {
        // @ts-expect-error
        literal([])
        // @ts-expect-error
        literal({})
      })
    })
    describe('explicit generic type annotation', () => {
      it('works with literals', () => {
        literal<['red']>('red')
        // @ts-expect-error
        literal<['green']>('red')

        literal<[1]>(1)
        // @ts-expect-error
        literal<[1]>(2)

        // @ts-expect-error
        literal<['1']>(1)
      })
    })
  })
  describe('unions of literals', () => {
    it('validates unions of literals correctly', () => {
      const isColor = literal('red', 'green', 'blue')
      expect(isColor('red')).toEqual(true)
      expect(isColor('green')).toEqual(true)
      expect(isColor('blue')).toEqual(true)
      expect(isColor('music')).toEqual(false)

      const isInUnion = literal('red', 1, true)
      expect(isInUnion('red')).toEqual(true)
      expect(isInUnion('green')).toEqual(false)
      expect(isInUnion(1)).toEqual(true)
      expect(isInUnion(2)).toEqual(false)
      expect(isInUnion(true)).toEqual(true)
      expect(isInUnion(false)).toEqual(false)
    })
    it('infers the types of unions of literals', () => {
      literal('red', 1, true) satisfies Guard<'red' | 1 | true>
      literal('red', 'green', 'blue') satisfies Guard<'red' | 'green' | 'blue'>
      // @ts-expect-error
      literal('red', 'green', 'blue') satisfies Guard<'red'>
    })
    test('explicit type annotation', () => {
      literal<['red', 'green', 'blue']>('red', 'green', 'blue')
      // @ts-expect-error
      literal<['red', 'green', 'blue']>('red')
      // @ts-expect-error
      literal<['red', 'green', 'blue']>('red', 'green', 'blue', 'music')
    })
  })
  describe('primitive', () => {
    it('matches null', () => {
      expect(literal(null)(null)).toEqual(true)
    })
    it('matches undefined', () => {
      expect(literal(undefined)(undefined)).toEqual(true)
    })
    it('matches strings', () => {
      expect(literal('')('')).toEqual(true)
      expect(literal('a')('a')).toEqual(true)
      expect(literal('abc')('123')).toEqual(false)
    })
    it('matches numbers', () => {
      expect(literal(-1)(-1)).toEqual(true)
      expect(literal(0)(0)).toEqual(true)
      expect(literal(1)(1)).toEqual(true)

      expect(literal(123)('123')).toEqual(false)
    })
    it('matches booleans', () => {
      expect(literal(true)(true)).toEqual(true)
      expect(literal(false)(false)).toEqual(true)
      expect(literal(true)(false)).toEqual(false)
      expect(literal(false)(true)).toEqual(false)
    })
  })
})
describe('sum types', () => {
  describe('unions', () => {
    describe('type checking', () => {
      it('returns a guard', () => {
        union(
          literal('red'),
          literal('green'),
          literal('blue'),
        ) satisfies Guard<'red' | 'green' | 'blue'>
        union(isString, isUndefined) satisfies Guard<string | undefined>
        union(isString, isNumber) satisfies Guard<string | number>
        union(isString) satisfies Guard<string>

        union(
          literal('red'),
          literal('green'),
          literal('blue'),
          // @ts-expect-error
        ) satisfies Guard<'a' | 'b' | 'c'>
        union(
          literal('red'),
          literal('green'),
          literal('blue'),
          // @ts-expect-error
        ) satisfies Guard<'red'>
        // @ts-expect-error
        union(isString, isUndefined) satisfies Guard<string>
      })
      describe('explicit generic type annotation', () => {
        it('works with literals', () => {
          union<['red', 'green', 'blue']>(
            literal('red'),
            literal('green'),
            literal('blue'),
          )
          union<['red', 'green', 'blue']>(
            // @ts-expect-error
            literal('a'),
            literal('b'),
            literal('c'),
          )
        })
        it('requires a guard of each type', () => {
          union<[string, undefined]>(isString, isUndefined)
          // @ts-expect-error
          union<[string, undefined]>(isUndefined)
          // @ts-expect-error
          union<[string, undefined]>(isString)
        })
        it('allows nested guards', () => {
          union<[string, number, undefined | null]>(
            isString,
            isNumber,
            union(isUndefined, isNull),
          )
        })
        it('handles primitive types', () => {
          union<[string, undefined]>(isString, isUndefined)
          union<[string, number]>(isString, isNumber)
          // @ts-expect-error
          union<[string, undefined]>(union(isString))
          // @ts-expect-error
          union<string>(union(isString, isUndefined))
        })
      })
    })
    it('does not match anything when the array is empty', () => {
      const isUnion = union()
      expect(isUnion('a')).toEqual(false)
      expect(isUnion(true)).toEqual(false)
      expect(isUnion(false)).toEqual(false)
      expect(isUnion(null)).toEqual(false)
      expect(isUnion(undefined)).toEqual(false)
    })
    it('matches any of the the guards in the array', () => {
      const isUnion = union(isString, isNumber, isNull)
      expect(isUnion('a')).toEqual(true)
      expect(isUnion(123)).toEqual(true)
      expect(isUnion(null)).toEqual(true)
    })
    it('only matches the guards in the array', () => {
      const isUnion = union(isString, isNumber, isNull)
      expect(isUnion('a')).toEqual(true)
      expect(isUnion(123)).toEqual(true)
      expect(isUnion(null)).toEqual(true)

      expect(isUnion(true)).toEqual(false)
      expect(isUnion(false)).toEqual(false)
      expect(isUnion(undefined)).toEqual(false)
    })
  })
  describe('generic property guards', () => {
    it('allows for generic, higher-order validation function', () => {
      type TreeNode<T> = {
        data: T
      }

      const isTreeNode = <T>(
        isData: (data: unknown) => data is T,
      ): Guard<TreeNode<T>> =>
        objectGuard({
          // In v0.0.0-beta.3, this caused a problem with optional properties.
          // Because data can be undefined, it got interpreted as an optional property, which clashed with the
          // definition of `TreeNode` which declares it as required.
          data: isData,
        })
    })
  })
  describe('optional', () => {
    it('matches undefined', () => {
      expect(optional(isString)(undefined)).toEqual(true)
    })
    it('mismatches undefined', () => {
      expect(optional(isString)(null)).toEqual(false)
    })
    it('matches the guard type of the guard argument', () => {
      expect(optional(isBoolean)(true)).toEqual(true)
      expect(optional(isNumber)(123)).toEqual(true)
      expect(optional(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(optional(isBoolean)(123)).toEqual(false)
      expect(optional(isNumber)('hello')).toEqual(false)
      expect(optional(isString)(true)).toEqual(false)
    })
    it('represent optional properties', () => {
      const isObj = objectGuard({
        a: optional(isString),
      })
      expect(isObj({ a: 'hello' })).toEqual(true)
      expect(isObj({ a: undefined })).toEqual(true)
      expect(isObj({})).toEqual(true)
    })
    test('type inference', () => {
      const isObj = objectGuard({
        id: isNumber,
        name: optional(isString),
      })
      type User = {
        id: number
        name?: string
      }
      type InferredUser = Infer<typeof isObj>
      // @ts-expect-error -- TODO can't get this to work
      const t1: Equals<User, InferredUser> = true
      const t2: InferredUser = {
        id: 0,
        name: 'Johannes',
      }
      // @ts-expect-error -- TODO can't get this to work
      const t3: InferredUser = {
        id: 0,
      }
      const t4: InferredUser = {
        id: 0,
        name: undefined,
      }
    })
  })
  describe('nullable', () => {
    it('matches undefined', () => {
      expect(nullable(isString)(undefined)).toEqual(false)
    })
    it('mismatches undefined', () => {
      expect(nullable(isString)(null)).toEqual(true)
    })
    it('matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(true)).toEqual(true)
      expect(nullable(isNumber)(123)).toEqual(true)
      expect(nullable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(123)).toEqual(false)
      expect(nullable(isNumber)('hello')).toEqual(false)
      expect(nullable(isString)(true)).toEqual(false)
    })
  })
  describe('optionalNullable', () => {
    it('matches undefined', () => {
      expect(optionalNullable(isString)(undefined)).toEqual(true)
    })
    it('mismatches undefined', () => {
      expect(optionalNullable(isString)(null)).toEqual(true)
    })
    it('matches the guard type of the guard argument', () => {
      expect(optionalNullable(isBoolean)(true)).toEqual(true)
      expect(optionalNullable(isNumber)(123)).toEqual(true)
      expect(optionalNullable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(optionalNullable(isBoolean)(123)).toEqual(false)
      expect(optionalNullable(isNumber)('hello')).toEqual(false)
      expect(optionalNullable(isString)(true)).toEqual(false)
    })
    it('represent optional properties', () => {
      const isObj = objectGuard({
        a: optionalNullable(isString),
      })
      expect(isObj({ a: 'hello' })).toEqual(true)
      expect(isObj({ a: undefined })).toEqual(true)
      expect(isObj({ a: null })).toEqual(true)
      expect(isObj({})).toEqual(true)
    })
  })
  describe('nullable', () => {
    it('mismatches undefined', () => {
      expect(nullable(isString)(undefined)).toEqual(false)
    })
    it('matches null', () => {
      expect(nullable(isString)(null)).toEqual(true)
    })
    it('matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(true)).toEqual(true)
      expect(nullable(isNumber)(123)).toEqual(true)
      expect(nullable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(nullable(isBoolean)(123)).toEqual(false)
      expect(nullable(isNumber)('hello')).toEqual(false)
      expect(nullable(isString)(true)).toEqual(false)
    })
  })
  describe('undefinable', () => {
    it('matches undefined', () => {
      expect(undefineable(isString)(undefined)).toEqual(true)
    })
    it('mismatches null', () => {
      expect(undefineable(isString)(null)).toEqual(false)
    })
    it('matches the guard type of the guard argument', () => {
      expect(undefineable(isBoolean)(true)).toEqual(true)
      expect(undefineable(isNumber)(123)).toEqual(true)
      expect(undefineable(isString)('hello')).toEqual(true)
    })
    it('only matches the guard type of the guard argument', () => {
      expect(undefineable(isBoolean)(123)).toEqual(false)
      expect(undefineable(isNumber)('hello')).toEqual(false)
      expect(undefineable(isString)(true)).toEqual(false)
    })
  })
})
describe('tuples', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      tuple([]) satisfies Guard<[]>
      tuple([isString]) satisfies Guard<[string]>
      tuple([isString, isNumber]) satisfies Guard<[string, number]>
      tuple([isNumber, isNumber, isNumber]) satisfies Guard<
        [number, number, number]
      >

      // @ts-expect-error
      tuple([isNumber]) satisfies Guard<[number, number]>
      // @ts-expect-error
      tuple([isString, isString]) satisfies Guard<[number, number]>
      // @ts-expect-error
      tuple([isNumber, isNumber]) satisfies Guard<[string, string]>
    })
    test('explicit generic type annotation', () => {
      tuple<[]>([])
      tuple<[string]>([isString])
      tuple<[string, number]>([isString, isNumber])
      tuple<[number, number, number]>([isNumber, isNumber, isNumber])
      // @ts-expect-error
      tuple<[number, number]>([isNumber])
      // @ts-expect-error
      tuple<[number, number]>([isString, isString])
      // @ts-expect-error
      tuple<[string, string]>([isNumber, isNumber])
    })
  })
  it('validates each element', () => {
    expect(tuple([])([])).toEqual(true)
    expect(tuple([isString])(['hello'])).toEqual(true)
    expect(tuple([isString, isNumber])(['hello', 123])).toEqual(true)
    expect(
      tuple([isString, isNumber, isBoolean])(['hello', 123, false]),
    ).toEqual(true)
  })
  it('does not allow additional elements', () => {
    expect(tuple([])([1])).toEqual(false)
    expect(tuple([isString])(['hello', 'hello again'])).toEqual(false)
    expect(tuple([isString, isNumber])(['hello', 123, true])).toEqual(false)
  })
  it('does not allow fewer elements', () => {
    expect(tuple([isBoolean])([])).toEqual(false)
    expect(tuple([isString, isString])(['hello'])).toEqual(false)
    expect(tuple([isString, isNumber])([])).toEqual(false)
  })
})

const suits = [
  {
    name: 'objectNoEval',
    fn: objectGuardNoEval,
  },
  {
    name: 'objectEval',
    fn: objectGuard,
  },
  //   TODO objectGuardMemo
]

suits.forEach(({ name: suiteName, fn: objectGuard }) => {
  describe(suiteName, () => {
    describe('objects', () => {
      describe('type checking', () => {
        it('returns a guard', () => {
          objectGuard({ a: isString }) satisfies Guard<{ a: string }>
          objectGuard({ a: isNumber }) satisfies Guard<{ a: number }>
          objectGuard({
            a: objectGuard({
              b: isNumber,
            }),
          }) satisfies Guard<{ a: { b: number } }>

          // @ts-expect-error
          objectGuard({ a: isString }) satisfies Guard<{ a: number }>
          // @ts-expect-error
          objectGuard({ a: isNumber }) satisfies Guard<{ a: string }>
          // @ts-expect-error
          objectGuard({ a: isNumber }) satisfies Guard<{ x: number }>

          objectGuard({
            a: objectGuard({ b: isNumber }),
            // @ts-expect-error
          }) satisfies Guard<{ a: { b: string } }>

          objectGuard({
            b: objectGuard({
              b: isNumber,
            }),
            // @ts-expect-error
          }) satisfies Guard<{ x: { y: number } }>
        })
        describe('explicit generic type annotation', () => {
          it('handles optional properties', () => {
            type User1 = {
              id: number
              name: string
            }
            objectGuard<User1>({
              id: isNumber,
              name: isString,
            })
            objectGuard<User1>({
              id: isNumber,
              // @ts-expect-error
              name: optional(isString),
            })

            type UserUndefinable = {
              id: number
              name: string | undefined
            }
            objectGuard<UserUndefinable>({
              id: isNumber,
              // required property, union of string and undefined
              name: undefineable(isString),
            })
            objectGuard<UserUndefinable>({
              id: isNumber,
              // @ts-expect-error - name can be undefined, but it is not optional
              name: optional(isString),
            })
            objectGuard<UserUndefinable>({
              id: isNumber,
              // string is more narrow than string | undefined, which means that if the validation passes for string, it satisfies User2
              name: isString,
            })
            objectGuard<UserUndefinable>({
              id: isNumber,
              // undefined is more narrow than string | undefined, which means that if the validation passes for undefined, it satisfies User2
              name: isUndefined,
            })
            // @ts-expect-error
            objectGuard<UserUndefinable>({
              id: isNumber,
              // If we don't check the property, we have no type information on the field (it's unknown).
              //  Therefore, the fact that it's optional should not mean that we can skip validation
              // name: isString,
            })

            type UserOptional = {
              id: number
              // This one is optional, not a union with undefined
              name?: string
            }
            const doNotEvenTry = () => {
              // May or may not throw an exception. The point is that it should give a type error.
              objectGuard<UserOptional>({
                id: isNumber,
                // Similarly to above; the property must have a corresponding validation function
                // @ts-expect-error
                name: undefined,
              })
            }
            objectGuard<UserOptional>({
              id: isNumber,
              // @ts-expect-error - requires optional function
              name: union(isUndefined, isString),
            })
            objectGuard<UserOptional>({
              id: isNumber,
              // As expected; requires the optional function
              name: optional(isString),
            })
          })
          it('works with complex objects', () => {
            type User1 = {
              id: number
              name: string
              address?: {
                country: string
                city: string
                streetAddress: string
                zipCode: number
              }
            }
            objectGuard<User1>({
              id: isNumber,
              name: isString,
              address: optional(
                objectGuard({
                  country: isString,
                  city: isString,
                  streetAddress: isString,
                  zipCode: isNumber,
                }),
              ),
            })
            type User2 = {
              // Changed the type of id to string to check erros
              id: string
              name: string
              address?: {
                country: string
                city: string
                streetAddress: string
                zipCode: number
              }
            }

            objectGuard<User2>({
              // @ts-expect-error
              id: isNumber,
              name: isString,
              address: optional(
                objectGuard({
                  country: isString,
                  city: isString,
                  streetAddress: isString,
                  zipCode: isNumber,
                }),
              ),
            })
          })
        })
        test('explicit generic type annotation', () => {
          objectGuard<{ a: string }>({ a: isString })
          objectGuard<{ a: number }>({ a: isNumber })
          objectGuard<{ a: { b: string } }>({
            a: objectGuard({ b: isString }),
          })

          // @ts-expect-error
          objectGuard<{ a: number }>({ a: isString })
          // @ts-expect-error
          objectGuard<{ a: string }>({ a: isNumber })
          objectGuard<{ a: { b: string } }>({
            // @ts-expect-error
            a: objectGuard({ b: isNumber }),
          })
          objectGuard<{ a: { b: string } }>({
            // @ts-expect-error
            x: objectGuard({ y: isNumber }),
          })
        })
      })
      it('validates null', () => {
        const isObj = objectGuard({})
        expect(isObj(null)).toEqual(false)
      })
      it('validates undefined', () => {
        const isObj = objectGuard({})
        expect(isObj(undefined)).toEqual(false)
      })
      it('validates empty records', () => {
        const isObj = objectGuard({})
        expect(isObj({})).toEqual(true)
      })
      it('allows unknown properties', () => {
        const isObj = objectGuard({})
        expect(isObj({ a: 'unexpected!' })).toEqual(true)
      })
      it('validates required properties', () => {
        const isObj = objectGuard({
          a: isString,
        })
        expect(
          isObj({
            a: 'hello',
          }),
        ).toEqual(true)
        expect(isObj({})).toEqual(false)
        expect(isObj({ a: undefined })).toEqual(false)
      })
      test('that undefinable properties are required', () => {
        const isObj = objectGuard({
          a: undefineable(isString),
        })
        expect(
          isObj({
            a: 'hello',
          }),
        ).toEqual(true)
        expect(isObj({})).toEqual(false)
        expect(isObj({ a: undefined })).toEqual(true)
      })
      it('validates optional properties', () => {
        const isObj = objectGuard({
          a: optional(isString),
        })
        expect(
          isObj({
            a: 'hello',
          }),
        ).toEqual(true)
        expect(isObj({})).toEqual(true)
        expect(isObj({ a: undefined })).toEqual(true)
      })
      it('differentiates between undefined and missing properties', () => {
        const isOptionalObj = objectGuard({
          a: optional(isString),
        })
        expect(isOptionalObj({})).toEqual(true)
        expect(isOptionalObj({ a: undefined })).toEqual(true)
        const isUnionObj = objectGuard({
          a: union(isString, isUndefined),
        })
        expect(isUnionObj({})).toEqual(false)
        expect(isUnionObj({ a: undefined })).toEqual(true)
      })
    })
  })
})

describe('partial records', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      partialRecord(isString, isString) satisfies Guard<
        Partial<Record<string, string>>
      >
      partialRecord(isString, isNumber) satisfies Guard<
        Partial<Record<string, number>>
      >
      // @ts-expect-error
      partialRecord(isString, isString) satisfies Guard<
        Partial<Record<string, number>>
      >
    })
    describe('explicit generic type annotation', () => {
      test('string as key', () => {
        partialRecord<string, string>(isString, isString)
        partialRecord<string, number[]>(isString, array(isNumber))
        // @ts-expect-error
        partialRecord<string, string>(isString, isNumber)
        // @ts-expect-error
        partialRecord<string, number[]>(isString, array(isString))
      })
      test('literal union as key', () => {
        partialRecord<'a', string>(literal('a'), isString)
        // @ts-expect-error
        partialRecord<'a', string>(isString, isString)
        // @ts-expect-error
        partialRecord<'a', string>(literal('b'), isString)
      })
    })
  })
  it('validates null', () => {
    expect(partialRecord(isString, isString)(null)).toEqual(false)
  })
  it('validates undefined', () => {
    expect(partialRecord(isString, isString)(undefined)).toEqual(false)
  })
  it('validates empty records', () => {
    expect(partialRecord(isString, isString)({})).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(partialRecord(isString, isString)([])).toEqual(false)
  })
  it('invalidates arrays', () => {
    expect(partialRecord(isString, isString)(['a'])).toEqual(false)
  })
  it('validates records where the type of the keys match', () => {
    expect(
      partialRecord(isString, isString)({ a: 'hello', b: 'hello2' }),
    ).toEqual(true)
    expect(partialRecord(isString, isNumber)({ a: 1, b: 1 })).toEqual(true)
    expect(partialRecord(isString, isBoolean)({ a: true, b: false })).toEqual(
      true,
    )
  })
  it('invalidates records where the type of any key does not match', () => {
    expect(partialRecord(isString, isString)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(partialRecord(isString, isNumber)({ a: 'hello', b: 1 })).toEqual(
      false,
    )
    expect(partialRecord(isString, isBoolean)({ a: 'hello', b: true })).toEqual(
      false,
    )
  })
  test('extra properties in the schema', () => {
    const isObj = objectGuard({
      a: isNumber,
      // @ts-expect-error - all properties must be guard functions
      b: 123,
    })
  })
  describe('keys', () => {
    it('allows keys to be of type string', () => {
      expect(
        partialRecord(isString, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(partialRecord(isString, isString)({})).toEqual(true)
    })
    it('does not allow extra keys', () => {
      const isKey = union(literal('a'), literal('b'))
      expect(
        partialRecord(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(
        partialRecord(
          isKey,
          isString,
        )({ a: 'hello', b: 'hello2', c: 'hello3' }),
      ).toEqual(false)
    })
    it('allows each key to be omitted', () => {
      const isKey = union(literal('a'), literal('b'))
      expect(
        partialRecord(isKey, isString)({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(partialRecord(isKey, isString)({ a: 'hello' })).toEqual(true)
      expect(partialRecord(isKey, isString)({})).toEqual(true)
    })
  })
})
describe('records', () => {
  describe('type checking', () => {
    it('returns a guard', () => {
      const keys = ['a', 'b', 'c'] as const
      record(keys, isString) satisfies Guard<Record<string, string>>
      record(keys, isNumber) satisfies Guard<Record<string, number>>
      // @ts-expect-error
      record(keys, isString) satisfies Guard<Record<string, number>>
    })
    describe('explicit generic type annotation', () => {
      test('string as key', () => {})
      test('literal union as key', () => {
        record<['a', 'b'], string>(['a', 'b'], isString)
        record<['a', 'b'], number[]>(['a', 'b'], array(isNumber))
        // @ts-expect-error
        record<['a', 'b'], string>(['a', 'b'], isNumber)
        // @ts-expect-error
        record<['a', 'b'], number[]>(['a', 'b'], array(isString))
      })
    })
  })
  it('validates null', () => {
    expect(record([], isString)(null)).toEqual(false)
  })
  it('validates undefined', () => {
    expect(record([], isString)(undefined)).toEqual(false)
  })
  it('validates empty records', () => {
    expect(record([], isString)({})).toEqual(true)
  })
  it('invalidates empty arrays', () => {
    expect(record([], isString)([])).toEqual(false)
  })
  it('invalidates arrays', () => {
    expect(record([], isString)(['a'])).toEqual(false)
  })
  it('validates records where the type of the keys match', () => {
    expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
      true,
    )
    expect(record(['a', 'b'], isNumber)({ a: 1, b: 1 })).toEqual(true)
    expect(record(['a', 'b'], isBoolean)({ a: true, b: false })).toEqual(true)
  })
  it('invalidates records where the type of any key does not match', () => {
    expect(record(['a', 'b'], isString)({ a: 'hello', b: 1 })).toEqual(false)
    expect(record(['a', 'b'], isNumber)({ a: 'hello', b: 1 })).toEqual(false)
    expect(record(['a', 'b'], isBoolean)({ a: 'hello', b: true })).toEqual(
      false,
    )
  })
  describe('keys', () => {
    it('allows keys to be of type string', () => {
      expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
        true,
      )
    })
    it('requires all keys to be present', () => {
      expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
        true,
      )
      expect(record(['a', 'b'], isString)({ a: 'hello' })).toEqual(false)
      expect(record(['a', 'b'], isString)({ b: 'hello2' })).toEqual(false)
    })
    it('does not allow extra keys', () => {
      expect(record(['a', 'b'], isString)({ a: 'hello', b: 'hello2' })).toEqual(
        true,
      )
      expect(
        record(['a', 'b'], isString)({ a: 'hello', b: 'hello2', c: 'hello3' }),
      ).toEqual(false)
    })
    it('handles optional keys', () => {
      expect(
        record(['a', 'b'], optional(isString))({ a: 'hello', b: 'hello2' }),
      ).toEqual(true)
      expect(record(['a', 'b'], optional(isString))({ a: 'hello' })).toEqual(
        true,
      )
      expect(record(['a', 'b'], optional(isString))({})).toEqual(true)
    })
  })
})
describe('recursive types', () => {
  describe('isArray', () => {
    describe('types', () => {
      it('returns a guard', () => {
        array(isString) satisfies Guard<string[]>
        // @ts-expect-error
        array(isString) satisfies Guard<number[]>
      })
      it('infers the exact type', () => {
        // Number
        const isNumberArray = array((d): d is number => true)
        type NumberArray = Infer<typeof isNumberArray>
        const assertionNumber1: Equals<NumberArray, number[]> = true
        const assertionNumber2: Equals<NumberArray, unknown[]> = false
        // String
        const isStringArray = array(isString)
        type StringArray = Infer<typeof isStringArray>
        const assertionString1: Equals<StringArray, string[]> = true
        const assertionString2: Equals<StringArray, unknown[]> = false
      })
      test('explicit generic type annotation', () => {
        array<number>(isNumber)
        array<string>(isString)
        array<string | number>(union(isString, isNumber))
        // @ts-expect-error
        array<number>(union(isString, isNumber))
        // @ts-expect-error
        array<string>(isNumber)
        // @ts-expect-error
        array<string[]>(isString)
        // @ts-expect-error
        array<string>(array(isNumber))
      })
    })
    it('validates null', () => {
      expect(array(isUnknown)(null)).toEqual(false)
    })
    it('validates undefined', () => {
      expect(array(isUnknown)(undefined)).toEqual(false)
    })
    it('validates unassigned values', () => {
      let data
      expect(array(isUnknown)(data)).toEqual(false)
    })
    it('validates booleans', () => {
      expect(array(isUnknown)(false)).toEqual(false)
      expect(array(isUnknown)(true)).toEqual(false)
    })
    it('validates numbers', () => {
      expect(array(isUnknown)(NaN)).toEqual(false)
      expect(array(isUnknown)(Infinity)).toEqual(false)
      expect(array(isUnknown)(0)).toEqual(false)
      expect(array(isUnknown)(1)).toEqual(false)
      expect(array(isUnknown)(3.14159)).toEqual(false)
    })
    it('validates strings', () => {
      expect(array(isUnknown)('')).toEqual(false)
      expect(array(isUnknown)('hello')).toEqual(false)
    })
    it('validates symbols', () => {
      expect(array(isUnknown)(Symbol())).toEqual(false)
    })
    it('validates objects', () => {
      expect(array(isUnknown)({})).toEqual(false)
    })
    it('validates empty arrays', () => {
      expect(array(isUnknown)([])).toEqual(true)
    })
    it('always validates empty arrays', () => {
      expect(array(isUnknown)([])).toEqual(true)
      expect(array(isString)([])).toEqual(true)
      expect(array(isBoolean)([])).toEqual(true)
      expect(array((data: unknown): data is unknown => false)([])).toEqual(true)
    })
    it('expects every element to pass the validation', () => {
      expect(array(union(isNumber))([1, 2, 3, 4])).toEqual(true)
      expect(array(union(isNumber))([1, 2, 3, 'a', 4])).toEqual(false)
      expect(
        array(union(isString, isNumber, isBoolean))([1, 'a', false]),
      ).toEqual(true)
    })
  })
})
