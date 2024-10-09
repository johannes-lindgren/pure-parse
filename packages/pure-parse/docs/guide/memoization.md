# Memoization

Since PureParse is a pure functional library, it is easy to use [memoize](memoization) to speed up the parsing for immutable data structures.

```ts
import { memo, object, parseString, parseNumber } from 'pure-parse'

const parseUser = memo(
  object({
    name: parseString,
    age: parseNumber,
  }),
)
```

> [!INFO]
> Internally, the `memo` function uses a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), so there will be no memory leaks.

> [!TIP]
> You can also memoize type guard functions.
