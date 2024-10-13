import { objectGuard, objectGuardNoJit } from './object'
import { describe, expect, it, test } from 'vitest'
import { isNumber, isString, isUndefined } from './primitives'
import { Guard } from './types'
import { optional, undefineable } from './validation'
import { union } from './union'

const suits = [
  {
    name: 'objectNoEval',
    fn: objectGuardNoJit,
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
