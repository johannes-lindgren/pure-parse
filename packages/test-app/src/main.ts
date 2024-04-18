import { array, isNumber, object, parseJson, isJsonValue } from 'pure-parse'

/**
 * Just for CI/CD testing: the actual UI doesn't matter
 */

const tests = [
  ['isNumber(1)', isNumber(1)],
  ['object({ a: isNumber })({ a: 1 })', object({ a: isNumber })({ a: 1 })],
  ['array(isNumber)([1,2,3])', array(isNumber)([1, 2, 3])],
  [
    'parseJson(object({ a: isNumber }))(JSON.stringify({ a: 1 }))',
    parseJson(object({ a: isNumber }))(JSON.stringify({ a: 1 })),
  ],
  ['isJsonValue({ a: 1 })', isJsonValue({ a: 1 })],
]

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Pure Parse Dist Tests</h1>
    <ul>
    ${tests
      .map(
        (test) => `
        <li>
          <code>${test[0]}</code> is <code>${test[1]}</code>
        </li>
    `,
      )
      .join('')}
    </ul>
  </div>
`
