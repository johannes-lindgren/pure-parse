import { describe, expect, it } from 'vitest'
import { isString } from './primitives'
import { Guard } from './types'
import { literalGuard } from './literal'
import { unionGuard } from './union'
import { objectGuard } from './object'
import { arrayGuard } from './arrays'

describe('README examples', () => {
  describe('Tree', () => {
    type Leaf<T> = { tag: 'leaf'; data: T }
    type Tree<T> = {
      tag: 'tree'
      data: (Tree<T> | Leaf<T>)[]
    }
    const leaf =
      <T>(guard: Guard<T>) =>
      (data: unknown): data is Leaf<T> =>
        objectGuard({
          tag: literalGuard('leaf'),
          data: guard,
        })(data)

    const tree =
      <T>(guard: Guard<T>) =>
      (data: unknown): data is Tree<T> =>
        unionGuard(
          leaf(guard),
          objectGuard({
            tag: literalGuard('tree'),
            data: arrayGuard(unionGuard(leaf(guard), tree(guard))),
          }),
        )(data)
    describe('leaf', () => {
      it('validates leaves', () => {
        expect(
          leaf(isString)({
            tag: 'leaf',
            data: 'hello',
          } satisfies Leaf<string>),
        ).toEqual(true)
      })
      it('requires tag', () => {
        expect(
          leaf(isString)({
            data: 'hello',
          }),
        ).toEqual(false)
      })
      it('requires data', () => {
        expect(
          leaf(isString)({
            tag: 'leaf',
            data: 123,
          }),
        ).toEqual(false)
      })
    })
    describe('tree', () => {
      it('validates empty trees', () => {
        expect(
          tree(isString)({
            tag: 'tree',
            data: [],
          } satisfies Tree<string>),
        ).toEqual(true)
      })
      it('requires tag', () => {
        expect(
          tree(isString)({
            data: [],
          }),
        ).toEqual(false)
      })
      it('requires data', () => {
        expect(
          tree(isString)({
            tag: 'tree',
          }),
        ).toEqual(false)
      })
    })
    it('validates trees with leaves', () => {
      expect(
        tree(isString)({
          tag: 'tree',
          data: [
            {
              tag: 'leaf',
              data: 'a',
            },
            {
              tag: 'leaf',
              data: 'b',
            },
          ],
        } satisfies Tree<string>),
      ).toEqual(true)
    })
    it('validates trees with trees', () => {
      expect(
        tree(isString)({
          tag: 'tree',
          data: [
            {
              tag: 'tree',
              data: [],
            },
            {
              tag: 'tree',
              data: [],
            },
          ],
        } satisfies Tree<string>),
      ).toEqual(true)
    })
    it('validates trees with trees and leaves', () => {
      expect(
        tree(isString)({
          tag: 'tree',
          data: [
            {
              tag: 'tree',
              data: [],
            },
            {
              tag: 'leaf',
              data: 'a',
            },
          ],
        } satisfies Tree<string>),
      ).toEqual(true)
    })
    it('validates recursive trees', () => {
      expect(
        tree(isString)({
          tag: 'tree',
          data: [
            {
              tag: 'tree',
              data: [
                {
                  tag: 'tree',
                  data: [
                    {
                      tag: 'leaf',
                      data: 'a',
                    },
                  ],
                },
              ],
            },
            {
              tag: 'leaf',
              data: 'a',
            },
          ],
        } satisfies Tree<string>),
      ).toEqual(true)
    })
  })
})
