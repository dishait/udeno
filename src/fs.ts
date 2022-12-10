import { dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile, rm, mkdir } from 'node:fs/promises'
import { writeFile as writeTextFile } from 'node:fs/promises'
export { writeFile as writeTextFile } from 'node:fs/promises'

export async function readTextFile(filepath: string) {
	const buffer = await readFile(filepath)
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

export function createTransformTextFile(
	handle: (
		filepath: string,
		content: string
	) => Promise<string>
) {
	return async function transformTextFile(
		filepath: string
	) {
		let content = await readTextFile(filepath)

		content = await handle(filepath, content)

		await writeTextFile(filepath, content)

		return filepath
	}
}

export async function ensureFile(filepath: string) {
	if (existsSync(filepath)) {
		return
	}

	await mkdir(dirname(filepath), {
		recursive: true
	})

	await writeTextFile(filepath, '')
}
