# test-app-imports

Verifies that all public exports of `pure-parse` can be imported under every TypeScript module resolution strategy used in the wild.

## What is tested

1. That pure-parse exports certain types and functions that are expected to be public.
2. That the exports can be imported under different TypeScript module resolution strategies.
3. That the app can be built under different TypeScript module resolution strategies.

## Configs

| Config | `module` | `moduleResolution` | Represents |
|---|---|---|---|
| `tsconfig.bundler.json` | `ESNext` | `bundler` | Vite, esbuild, webpack, Parcel |
| `tsconfig.nodenext.json` | `NodeNext` | `NodeNext` | Node.js ESM (`"type": "module"`) |
| `tsconfig.cjs.json` | `CommonJS` | `node` | Node.js CJS (`require()`) |
