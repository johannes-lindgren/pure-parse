import { guardTests } from './guard.ts'
import { parsingTests } from './parse.ts'

const renderTests = (tests: unknown[][]) =>
  `<ul>${tests
    .map(
      (test) => `
        <li>
          <code>${test[0]}</code> → <code>${JSON.stringify(test[1])}</code>
        </li>
    `,
    )
    .join('')}</ul>`

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Pure Parse Dist Tests</h1>
    <h2><code>pure-parse</code></h2>
    ${renderTests(parsingTests)}
    <h2><code>pure-parse/guard</code></h2>
    ${renderTests(guardTests)}
  </div>
`
