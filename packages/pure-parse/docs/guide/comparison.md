# Comparison With Other Libraries

What sets `pure-parse` apart from other validation libraries is the freedom it gives to the user to choose between type inference and explicit type declarations.

## Performance

`pure-parse` is benchmarked against other validation libraries:

- It's roughtly 4× faster than Zod

[//]: # 'TODO'

Since `pure-parse` is a pure functional library, it is easy to use [memoize](memoization), which gives a free performance boost when dealing with repetitive validation on immutable data structured. Internally, the `memo` function uses a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), so there will be no memory leaks.

## Type Declarations

Unlike Zod, [pure-parse](https://www.npmjs.com/package/pure-parse)—like [Zod](https://www.npmjs.com/package/zod) _also_ allows you the options to declare your types explicitly:

```ts
type User = {
  id: number
  name: string
}
const isUser = object<User>({
  id: isNumber,
  name: isString,
})
```

There are many benefits of this approach:

- The type aliases are not coupled to the validation library, which makes it easier to migrate to another validation library.
- The type alias serves as a single source of truth.
- If the validation function does not match the type, you will get a type error.
- By declaring the types explicitly, you can make the code more readable and maintainable. Explicit types serve and as a single source of truth.
- Inferred types often consist of complex expressions, which can be hard to read.

## Type Inference _and_ Explicit Type Declarations

Unlike [Joi](https://www.npmjs.com/package/joi), [pure-parse](https://www.npmjs.com/package/pure-parse)—like [Zod](https://www.npmjs.com/package/zod)—is able to infer the type:

```ts
const isUser = object({
  id: isNumber,
  name: isString,
})
type User = Infer<typeof isUser>
```

## Lightweight

[pure-parse](https://www.npmjs.com/package/pure-parse)—like [Zod](https://www.npmjs.com/package/zod) library is tiny. It is also tree-shakeable, and since it exports individual functions rather than classes, bundlers are able to tree-shake away _all_ the functionality that your app is not using.

Having a small size (and by being tree-shakable) [pure-parse](https://www.npmjs.com/package/pure-parse) ensures that the final footprint on the application bundle size is minimal:

| Library                                                | Minified + Zipped |
| ------------------------------------------------------ | ----------------- |
| [pure-parse](https://www.npmjs.com/package/pure-parse) | 3.0 kB            |
| [Zod](https://www.npmjs.com/package/zod)               | 21 kB             |
| [Yup](https://www.npmjs.com/package/yup)               | 60 kB             |
| [Joi](https://www.npmjs.com/package/joi)               | 236 kB            |

> [!NOTE]
> Even though other libraries might be much larger, the final contribution to the bundle size will depend on whether the library is tree-shakeable, how tree-shakeable it is, and how many features of the library your application uses.

## Schema-free and Extensible

Unlike other validation libraries—such as [Zod](https://www.npmjs.com/package/zod)
and [Joi](https://www.npmjs.com/package/joi)—[pure-parse](https://www.npmjs.com/package/pure-parse)—[pure-parse](https://www.npmjs.com/package/pure-parse) has no concept of a schema: instead, users deal exclusively with [parsers](parsers) [gurard](guards). This makes `pure-parse` very easy to extend: when you need a validation function which is not included in the library, you can easily construct it yourself and seamlessly integrate it with the core functionality. The functions in `pure-parse` are not treated any differently than the ones you write yourself (except for optional alidator functions).

Due to the small size, by design, the library does _not_ contain every feature under the sun. This library focuses on providing foundational building blocks that you can compose to validate most of your data structures.
