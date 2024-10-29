import os from 'os'

const counts = (strs) =>
  strs.reduce((acc, str) => {
    acc[str] = (acc[str] || 0) + 1
    return acc
  }, {})

export const printCpuInfo = () => {
  const cpus = os.cpus().map((cpu) => `${cpu.model} @ ${cpu.speed} MHz`)
  console.log('CPUs:')
  Object.entries(counts(cpus)).forEach(([cpu, count]) => {
    console.log(`  ${cpu} x ${count}`)
  })
}
