# Comparison With Other Libraries

What sets PureParse apart from other validation libraries is the freedom it gives to the user to choose between type inference and explicit type declarations.

For a more detailed comparison, see the [overview](./overview).

## Performance Benchmarks

PureParse is benchmarked against other validation libraries; see https://moltar.github.io/typescript-runtime-type-benchmarks/.

Here are some results as measured on October, 2024:

- Chip: Apple M1 Pro
- Memory: 16 GB

> [!IMPORTANT]
> The benchmark measures a very specific use case: the performance of parsing/validating a small object with only required properties, of which one is another object. Not all parsers in the table below have the same feature set.

Loose assertion means that the function checks if the object conforms to the schema, and does not invalidate data that contains unknown properties. This corresponds to PureParse's guard functions:

| Function                                              | Mops/s | Relative to PureParse |
| ----------------------------------------------------- | ------ | --------------------- |
| [PureParse](https://www.npmjs.com/package/pure-parse) | 74.4   | 100%                  |
| [Zod](https://www.npmjs.com/package/zod)              | 1.12   | 1.4%                  |
| [Joi](https://www.npmjs.com/package/joi)\*            | —      | —                     |
| [io-ts](https://www.npmjs.com/package/io-ts)          | 3.5    | 4.7%                  |
| [Ajv](https://www.npmjs.com/package/ajv)              | 49     | 65%                   |
| [Yup](https://www.npmjs.com/package/yup)              | 84     | 120%                  |
| [Typia](https://www.npmjs.com/package/typia)          | 101    | 136%                  |

Safe parsing means that a copy of the parsed data is returned, which contains only those properties that were declared. This protects against prototype pollution, and corresponds to PureParse's parsers.

| Function                                              | Mops/s | Relative to PureParse |
| ----------------------------------------------------- | ------ | --------------------- |
| [PureParse](https://www.npmjs.com/package/pure-parse) | 28.4   | 100%                  |
| [Zod](https://www.npmjs.com/package/zod)              | 1.13   | 3.9%                  |
| [Joi](https://www.npmjs.com/package/joi) \*           | —      | —                     |
| [io-ts](https://www.npmjs.com/package/io-ts)\*        | —      | —                     |
| [Ajv](https://www.npmjs.com/package/ajv)\*            | —      | —                     |
| [Yup](https://www.npmjs.com/package/yup)              | 81.4   | 286%                  |
| [Typia](https://www.npmjs.com/package/typia)          | 57.7   | 203%                  |

\*No benchmark data available

## Size Comparison

| Library                                               | Minified + Zipped |
| ----------------------------------------------------- | ----------------- |
| [PureParse](https://www.npmjs.com/package/pure-parse) | 3 kB              |
| [Zod](https://www.npmjs.com/package/zod)              | 21 kB             |
| [Joi](https://www.npmjs.com/package/joi)              | 236 kB            |
| [Ajv](https://www.npmjs.com/package/ajv)              | 32 kB             |
| [Yup](https://www.npmjs.com/package/yup)              | 60 kB             |

> [!NOTE]
> Even though other libraries might be much larger, the final contribution to the bundle size will depend on whether the library is tree-shakeable, how tree-shakeable it is, and how many features of the library are used in the application.

## Zod

In Zod, it is not possible to annotate the schemas with a type alias—you are instead supposed to derive your types from the schemas, which has the drawback that it couples your type aliases to Zod.

Zod is more difficult to extend with custom validation logic. (In PureParse, you just implement a function of the `Parse<?>` or `Guard<?>` type.)

## Joi

In Joi, you can annotate the schemas with a type alias, but it does not validate the schema completely. As such, there is no real type safety.

Joi can't infer the type from a schema.

## Ajv

Ajv is a JSON Schema validator, which serves different purpose than PureParse.

Ajv compiles JSON Schemas into JavaScript, which leads to fast execution. However, the JSON schema syntax is verbose, does not interoperate well with TypeScript, and does not lend itself well to customization of validation logic.

## Yup

Yup cannot _correctly_ infer the type from schemas—you can infer something, but it is not 100% correct.

Yup does allow asynchronous validation, which PureParse does (yet) not support.

Yup can be very slow.

## Typia

Typia is a compiler that generates validation logic based on type aliases. The resulting code is incredibly fast, but customization happens in comments via a domain specific language, rather than with regular JavaScript code. When working with immutable data structures, PureParse can outperform Typia thanks to memoization.
