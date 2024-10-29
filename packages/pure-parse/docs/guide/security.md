# Security

PureParse is designed to be secure by default.

## Prototype Pollution

To protect your app against prototype pollution, it is generally recommended to validate external data with parsers instead of guard functions. The parsers return a copy of the parsed data, which contains only those properties that were declared. However, the guards only validate that the structure of the data fits the inferred type, and thus does not consider the presence of additional properties.

## Content Security Policy

The [objectCompiled](/api/parsers/object#objectCompiled) and [objectGuardCompiled](/api/guards/object#objectGuardCompiled) functions perform just-in-time (JIT) compilation with the `Function` constructor. This increases parsing performance, but browser pages that enable
[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) (CSP) might block the usage of the `Function` constructor. Enable the `unsafe-eval` directive in the CSP header or stick to [object](/api/parsers/object#object) and [objectGuard](/api/parsers/object#objectGuard) that do not call the `Function` constructor.

> [!TIP]
> For more information on the performance differences, see the [benchmarks](/guide/comparison.html#performance-benchmarks).
