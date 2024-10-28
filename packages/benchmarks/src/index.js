/* benchmark.js */
import b from 'benny'
import {
  object as objectJit,
  objectNoJit,
  optional,
  parseNumber,
  parseString,
} from 'pure-parse'
import { printCpuInfo } from './printCpuInfo.js'

printCpuInfo()

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

b.suite(
  'Initializing Parsers',

  b.add('JIT compilation', () => {
    return () => {
      const parse = createObjectParser(objectJit)
    }
  }),

  b.add('non-JIT compilation', () => {
    return () => {
      const parse = createObjectParser(objectNoJit)
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
    const parse = createObjectParser(objectJit)
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
    const parse = createObjectParser(objectNoJit)
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

// b.suite(
//   'Instantiating Parser + One Parse',
//
//   b.add('JIT compilation', () => {
//     const data = {
//       a: 'hello',
//       b: 42,
//       d: {
//         e: 42,
//         f: 'world',
//       },
//     }
//     return () => {
//       const parse = createObjectParser(objectJit)
//       parse(data)
//     }
//   }),
//
//   b.add('non-JIT compilation', () => {
//     const data = {
//       a: 'hello',
//       b: 42,
//       d: {
//         e: 42,
//         f: 'world',
//       },
//     }
//     return () => {
//       const parse = createObjectParser(objectNoJit)
//       parse(data)
//     }
//   }),
//
//   b.cycle(),
//   b.complete(),
//   b.save({ file: 'reduce', version: '1.0.0' }),
//   b.save({ file: 'reduce', format: 'chart.html' }),
// )
