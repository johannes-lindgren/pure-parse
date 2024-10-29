/* benchmark.js */
import b from 'benny'
import {
  objectCompiled,
  object as objectNonCompiled,
  optional,
  parseNumber,
  parseString,
} from 'pure-parse'

const createObjectParser = (object) =>
  object({
    a: parseString,
    b: parseNumber,
    c: optional(parseString),
    d: object({
      e: parseNumber,
      f: parseString,
    }),
  })

export const compiledSuite = () => {
  b.suite(
    'Parsing construction',

    b.add('JIT compilation', () => {
      return () => {
        const parse = createObjectParser(objectCompiled)
      }
    }),

    b.add('non-JIT compilation', () => {
      return () => {
        const parse = createObjectParser(objectNonCompiled)
      }
    }),

    b.cycle(),
    b.complete(),
    b.save({ file: 'reduce', version: '1.0.0' }),
    b.save({ file: 'reduce', format: 'chart.html' }),
  )

  b.suite(
    'Parsing',

    b.add('JIT compilation', () => {
      const parse = createObjectParser(objectCompiled)
      const data = {
        a: 'hello',
        b: 42,
        d: {
          e: 42,
          f: 'world',
        },
      }
      return () => {
        parse(data)
      }
    }),

    b.add('non-JIT compilation', () => {
      const parse = createObjectParser(objectNonCompiled)
      const data = {
        a: 'hello',
        b: 42,
        d: {
          e: 42,
          f: 'world',
        },
      }
      return () => {
        parse(data)
      }
    }),

    b.cycle(),
    b.complete(),
    b.save({ file: 'reduce', version: '1.0.0' }),
    b.save({ file: 'reduce', format: 'chart.html' }),
  )

  b.suite(
    'Parser construction + one parse',

    b.add('JIT compilation', () => {
      const data = {
        a: 'hello',
        b: 42,
        d: {
          e: 42,
          f: 'world',
        },
      }
      return () => {
        const parse = createObjectParser(objectCompiled)
        parse(data)
      }
    }),

    b.add('non-JIT compilation', () => {
      const data = {
        a: 'hello',
        b: 42,
        d: {
          e: 42,
          f: 'world',
        },
      }
      return () => {
        const parse = createObjectParser(objectNonCompiled)
        parse(data)
      }
    }),

    b.cycle(),
    b.complete(),
    b.save({ file: 'reduce', version: '1.0.0' }),
    b.save({ file: 'reduce', format: 'chart.html' }),
  )
}
