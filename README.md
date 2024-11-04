<div align="center">
  <h1 align="center">PureParse</h1>
  <h3>Typesafe, lightweight parsers</h3>
  <p align="center">
    Lightweight validation library that decouples type aliases from validation logic
  </p>
  <p align="center">
    <a href="https://pure-parse.vercel.app">Documentation</a>
  </p>
</div>

<p align="center">
<a href="https://github.com/johannes-lindgren/pure-parse/actions?query=branch%3Amain"><img src="https://github.com/johannes-lindgren/pure-parse/actions/workflows/test.yml/badge.svg?event=push&branch=main" alt="CI Status for Tests" /></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/badge/Licence-MIT-green" alt="License"></a>
<a href="https://github.com/johannes-lindgren" rel="nofollow"><img src="https://img.shields.io/badge/Author-@johannes--lindgren-blue.svg" alt="Created by Johannes Lindgren"></a>
</p>

Declare the type:

```ts
type User = {
  id: number
  name: string
}

const parseUser = object<User>({
  id: parseNumber,
  name: parseString,
})
```

...or infer the type:

```ts
const parseUser = object({
  id: parseNumber,
  name: parseString,
})

type User = Infer<typeof parseUser>
```

<br/>

<br/>
<div align="center">
  <em>By <a href="https://github.com/johannes-lindgren">@johannes-lindgren</a></em>
</div>
