import { bar } from './bar'

console.log(bar)

const mlly = await import('mlly')
const path = await import('path')

export { bar } from './bar'

export * from './bar'
