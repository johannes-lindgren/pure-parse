# Comparison With Other Libraries

What sets PureParse apart from other validation libraries is the freedom it gives to the user to choose between type inference and explicit type declarations.

For a more detailed comparison, see the [overview](./overview).

## Performance Benchmarks

PureParse is benchmarked against other validation libraries:

- It's roughtly 4× faster than Zod
- If not memoized, it is slower than the compiled validation libraries (like Typia and Ajv)
- If memoized, it is as fast as any JavaScript-based validation library can be.

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
