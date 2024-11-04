import { describe, expect, it, test } from 'vitest'
import {
  array,
  failure,
  literal,
  object,
  Parser,
  parseString,
  success,
  oneOf,
  optional,
  RequiredParser,
} from '../parsers'
import {
  arrayGuard,
  Guard,
  isString,
  literalGuard,
  objectGuard,
  unionGuard,
} from '../guards'

describe('Documentation examples', () => {
  describe('parseNumberFromString', () => {
    /*
     * Code snippet from guides/customizing.md
     */

    const parseNumberFromString: Parser<number> = (data: unknown) => {
      if (!isString(data)) {
        return failure('Expected a string')
      }
      const parsed = Number(data)
      return data !== '' &&
        !hasWhiteSpace(data) &&
        !isNaN(parsed) &&
        isFinite(parsed)
        ? success(parsed)
        : failure(
            `The string could not be parsed into a number: got ${JSON.stringify(
              data,
            )}`,
          )
    }

    const hasWhiteSpace = (str: string): boolean => {
      return /\s+/.test(str)
    }

    it('parses natural numbers', () => {
      expect(parseNumberFromString('123')).toEqual({
        tag: 'success',
        value: 123,
      })
    })
    it('parses 0', () => {
      expect(parseNumberFromString('0')).toEqual({
        tag: 'success',
        value: 0,
      })
    })
    it('parses negative numbers', () => {
      expect(parseNumberFromString('-123')).toEqual({
        tag: 'success',
        value: -123,
      })
    })
    it('parses floating point numbers', () => {
      expect(parseNumberFromString('0.1')).toHaveProperty('tag', 'success')
      expect(parseNumberFromString('-0.1')).toHaveProperty('tag', 'success')
      expect(parseNumberFromString('3.14')).toHaveProperty('tag', 'success')
      expect(parseNumberFromString('3435.324324')).toHaveProperty(
        'tag',
        'success',
      )
    })
    it('rejects strings with whitespace', () => {
      expect(parseNumberFromString(' 123')).toHaveProperty('tag', 'failure')
      expect(parseNumberFromString('123 ')).toHaveProperty('tag', 'failure')
      expect(parseNumberFromString(' 123 ')).toHaveProperty('tag', 'failure')
    })
    it('rejects strings with letters', () => {
      expect(parseNumberFromString('123a')).toHaveProperty('tag', 'failure')
      expect(parseNumberFromString('a123')).toHaveProperty('tag', 'failure')
      expect(parseNumberFromString('a123a')).toHaveProperty('tag', 'failure')
    })
    it('rejects empty strings', () => {
      expect(parseNumberFromString('')).toHaveProperty('tag', 'failure')
    })
    it('rejects Infinity', () => {
      expect(parseNumberFromString('Infinity')).toHaveProperty('tag', 'failure')
    })
    it('rejects NaN', () => {
      expect(parseNumberFromString('NaN')).toHaveProperty('tag', 'failure')
    })
    it('rejects very large integers', () => {
      expect(
        parseNumberFromString('9007199489375r893475984375254740992'),
      ).toHaveProperty('tag', 'failure')
    })
  })
  describe('tree', () => {
    /*
     * Code snippet from guides/parsers.md
     */

    type Leaf<T> = {
      tag: 'leaf'
      data: T
    }
    type Tree<T> = {
      tag: 'tree'
      data: (Tree<T> | Leaf<T>)[]
    }

    // `RequiredParser` means that the user gets an error if they pass an optional parser; for example, `leaf(optional(parseString))`
    const leaf =
      <T>(parser: RequiredParser<T>): Parser<Leaf<T>> =>
      (data) =>
        // @ts-expect-error TypeScript gives a false error for the `data` property:
        //  we have already guaranteed that `parser` does not represent an optional property, yet TypeScript complains
        object({
          tag: literal('leaf'),
          data: parser,
        })(data)

    const tree =
      <T>(parser: RequiredParser<T>): Parser<Tree<T>> =>
      (data) =>
        object({
          tag: literal('tree'),
          data: array(oneOf(leaf(parser), tree(parser))),
        })(data)

    describe('leaf', () => {
      it('validates leaves', () => {
        const data = {
          tag: 'leaf',
          data: 'hello',
        } satisfies Leaf<string>
        expect(leaf(parseString)(data)).toHaveProperty('tag', 'success')
      })
      it('requires tag', () => {
        const data = {
          data: 'hello',
        }
        expect(leaf(parseString)(data)).toHaveProperty('tag', 'failure')
      })
      it('requires data', () => {
        const data = {
          tag: 'leaf',
          data: 123,
        }
        expect(leaf(parseString)(data)).toHaveProperty('tag', 'failure')
      })
    })
    describe('tree', () => {
      it('validates empty trees', () => {
        let data = {
          tag: 'tree',
          data: [],
        } satisfies Tree<string>
        expect(tree(parseString)(data)).toHaveProperty('tag', 'success')
      })
      it('requires tag', () => {
        let data = {
          data: [],
        }
        expect(tree(parseString)(data)).toHaveProperty('tag', 'failure')
      })
      it('requires data', () => {
        let data = {
          tag: 'tree',
        }
        expect(tree(parseString)(data)).toHaveProperty('tag', 'failure')
      })
    })
    it('validates trees with leaves', () => {
      let data = {
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
      } satisfies Tree<string>
      expect(tree(parseString)(data)).toHaveProperty('tag', 'success')
    })
    it('validates trees with trees', () => {
      let data = {
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
      } satisfies Tree<string>
      expect(tree(parseString)(data)).toHaveProperty('tag', 'success')
    })
    it('validates trees with trees and leaves', () => {
      let data = {
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
      } satisfies Tree<string>
      expect(tree(parseString)(data)).toHaveProperty('tag', 'success')
    })
    it('validates recursive trees', () => {
      let data = {
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
      } satisfies Tree<string>
      expect(tree(parseString)(data)).toHaveProperty('tag', 'success')
    })
  })

  describe('treeGuard', () => {
    /*
     * Code snippet from guides/guards.md
     */

    type Leaf<T> = { tag: 'leaf'; data: T }
    type Tree<T> = {
      tag: 'tree'
      data: (Tree<T> | Leaf<T>)[]
    }
    const leafGuard =
      <T>(guard: Guard<T>): Guard<Leaf<T>> =>
      (data) =>
        objectGuard({
          tag: literalGuard('leaf'),
          data: guard,
        })(data)

    const treeGuard =
      <T>(guard: Guard<T>): Guard<Tree<T>> =>
      (data) =>
        objectGuard({
          tag: literalGuard('tree'),
          data: arrayGuard(unionGuard(leafGuard(guard), treeGuard(guard))),
        })(data)

    describe('leaf', () => {
      it('validates leaves', () => {
        expect(
          leafGuard(isString)({
            tag: 'leaf',
            data: 'hello',
          } satisfies Leaf<string>),
        ).toEqual(true)
      })
      it('requires tag', () => {
        expect(
          leafGuard(isString)({
            data: 'hello',
          }),
        ).toEqual(false)
      })
      it('requires data', () => {
        expect(
          leafGuard(isString)({
            tag: 'leaf',
            data: 123,
          }),
        ).toEqual(false)
      })
    })
    describe('tree', () => {
      it('validates empty trees', () => {
        expect(
          treeGuard(isString)({
            tag: 'tree',
            data: [],
          } satisfies Tree<string>),
        ).toEqual(true)
      })
      it('requires tag', () => {
        expect(
          treeGuard(isString)({
            data: [],
          }),
        ).toEqual(false)
      })
      it('requires data', () => {
        expect(
          treeGuard(isString)({
            tag: 'tree',
          }),
        ).toEqual(false)
      })
    })
    it('validates trees with leaves', () => {
      expect(
        treeGuard(isString)({
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
        treeGuard(isString)({
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
        treeGuard(isString)({
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
        treeGuard(isString)({
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
