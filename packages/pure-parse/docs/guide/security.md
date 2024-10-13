# Security

PureParse is designed to be secure by default.

## Prototype Pollution

To protect your app against prototype pollution, it is recommended to use the parsers instead of the guard functions. The parsers return a copy of the parsed data, which contains only those properties that were declared.

## Content Security Policy

To use PureParse in a
browser page that enables
[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) (CSP), either:

1. Use `objectNoJit` and `objectGuardNoJit` instead of `object` and `objectGuard`.
2. Enable the `unsafe-eval` directive in the CSP header.

PureParse itself is safe from XSS, but websites sometimes indiscriminately forbid the usage of `eval` and the `Function` constructor in their entire source code. PureParse's `object` and `objectGuard` functions use the `Function` constructor for increased performance will thus be affected if the CSP header is enabled. The `objectNoJit` and `objectGuardNoJit` functions are alternative implementations that are somewhat slower, but are immune to CSP restrictions.

> [!TIP]
> For more information on the performance differences, see the [benchmarks](/guide/comparison.html#performance-benchmarks).
