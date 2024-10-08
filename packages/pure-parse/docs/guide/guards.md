# Guards

[//]: # 'TODO link'

Guards are functions that accepts one `unknown` argument and returns a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates):

```ts
type Guard<T>: (data) => data is T;
```
