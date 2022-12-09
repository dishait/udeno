import { existsSync } from 'node:fs'
import { readFile, rm } from 'node:fs/promises'
export { writeFile as writeTextFile } from 'node:fs/promises'

export async function readTextFile(path: string) {
	const buffer = await readFile(path)
	return buffer.toString()
}

export async function clean(path: string) {
	if (existsSync(path)) {
		await rm(path, {
			force: true,
			recursive: true
		})
	}
}
