import { udeno } from './index'
import consola from 'consola'

async function main() {
	await udeno()
}

main().catch(err => {
	consola.withTag('udeno').error(err.message)
})
