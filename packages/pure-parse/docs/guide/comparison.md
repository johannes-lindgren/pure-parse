# Comparison With Other Libraries

What sets PureParse apart from other validation libraries is the freedom it gives to the user to choose between type inference and explicit type declarations.

For a more detailed comparison, see the [Why PureParse](./why-pure-parse.md) aricle.

## Performance Benchmarks

PureParse is benchmarked against other validation libraries; see https://moltar.github.io/typescript-runtime-type-benchmarks/.

Here are some results as measured on October, 2024:

- Chip: Apple M1 Pro
- Memory: 16 GB

> [!IMPORTANT]
> The benchmark measures a very specific use case: the performance of parsing/validating a small object with required properties, one of which is another object:

> [!IMPORTANT]
> Not all parsers in the tables below have the same feature set, so the benchmarks are not entirely comparable.

### Loose Assertion

_Loose assertion_ means that the function checks if the object conforms to the schema, and does not invalidate data that contains unknown properties. This corresponds to PureParse's guard functions:

| Function                                              | Mops/s | Relative to PureParse |
| ----------------------------------------------------- | ------ | --------------------- |
| [PureParse](/api/guards/object#objectGuardCompiled)\* | 75.5   | 100%                  |
| [PureParse](/api/guards/object#objectGuard)           | 5.7    | 7.5%                  |
| [Zod](https://www.npmjs.com/package/zod)              | 1.12   | 1.4%                  |
| [io-ts](https://www.npmjs.com/package/io-ts)          | 3.5    | 4.7%                  |
| [Ajv](https://www.npmjs.com/package/ajv)\*            | 49     | 65%                   |
| [Yup](https://www.npmjs.com/package/yup)\*            | 84     | 120%                  |
| [Typia](https://www.npmjs.com/package/typia)\*\*      | 101    | 136%                  |

\* Just-in-time (JIT) compilation<br>
\*\* Ahead-of-time compilation<br>

### Safe Parsing

_Safe parsing_ means that a copy of the parsed data is returned, which contains only those properties that were declared. This protects against prototype pollution, and corresponds to PureParse's parsers.

| Function                                          | Mops/s | Relative to PureParse |
| ------------------------------------------------- | ------ | --------------------- |
| [PureParse](/api/parsers/object#objectCompiled)\* | 28.4   | 100%                  |
| [PureParse](/api/parsers/object#object)           | 4.1    | 5.5%                  |
| [Zod](https://www.npmjs.com/package/zod)          | 1.13   | 3.9%                  |
| [io-ts](https://www.npmjs.com/package/io-ts)†     | —      | —                     |
| [Ajv](https://www.npmjs.com/package/ajv)\*†       | —      | —                     |
| [Yup](https://www.npmjs.com/package/yup)\*        | 81.4   | 286%                  |
| [Typia](https://www.npmjs.com/package/typia)\*\*  | 57.7   | 203%                  |

\* Just-in-time (JIT) compilation<br>
\*\* Ahead-of-time compilation<br>
†No benchmark data available—the operation might not be supported by the library<br>

## Size Comparison

| Library                                               | Minified + Zipped |
| ----------------------------------------------------- | ----------------- |
| [PureParse](https://www.npmjs.com/package/pure-parse) | 5 kB              |
| [Zod](https://www.npmjs.com/package/zod)              | 21 kB             |
| [Joi](https://www.npmjs.com/package/joi)              | 236 kB            |
| [Ajv](https://www.npmjs.com/package/ajv)              | 32 kB             |
| [Yup](https://www.npmjs.com/package/yup)              | 60 kB             |
| [Typia](https://www.npmjs.com/package/typia)\*        | —                 |

\*Typia is a compiler

> [!NOTE]
> Even though other libraries might be much larger, the final contribution to the bundle size will depend on whether the library is tree-shakeable, how tree-shakeable it is, and how many features of the library are used in the application.

## Zod

In Zod, it is not possible to annotate the schemas with a type alias—you are instead supposed to derive your types from the schemas, which has the drawback that it couples your type aliases to Zod.

Zod is more difficult to extend with custom validation logic. (In PureParse, you just implement a function of the `Parse<?>` or `Guard<?>` type.)

## Joi

In Joi, you can annotate the schemas with a type alias, but it does not validate the schema completely. As such, there is no real type safety.

Joi cannot infer the type from a schema.

## Ajv

Ajv is a JSON validator and conforms to the JSON Schema specification. However, the JSON schema syntax is verbose, does not interoperate well with TypeScript, and does not lend itself well to customization of validation logic.

## Yup

Yup cannot _correctly_ infer the type from schemas—you can infer something, but it is not 100% correct.

Yup does allow asynchronous validation.

## Typia

Typia is a compiler that generates validation logic based on type aliases. The resulting code is fast, and the boilerplate is minimal, but customization happens in a non-standard [comments](https://typia.io/docs/validators/tags/#comment-tags) and so-called [type-tags](https://typia.io/docs/validators/tags/#type-tags)—also non-standard. In PureParse, this happens in regular JavaScript code.

When working with immutable data structures, PureParse can outperform Typia thanks to memoization.

Typia does not have error messages.
