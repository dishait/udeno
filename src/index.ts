import copy from 'cpy'
import fg from 'fast-glob'
import { find } from './find'
import { defaultNormalize } from './normalize'
import { normalize as normalizePath } from 'node:path'
import { clean, writeTextFile, readTextFile } from './fs'
import type {
	IOptions,
	ReducePayload,
	ReducePretreat
} from './type'

export async function udeno(
	options: Partial<IOptions> = {}
) {
	const {
		src = 'src',
		depsDir = 'deps',
		npmSpecifiers = true,
		index = 'src/index.ts',
		npmCDN = 'https://esm.sh/',
		normalize = defaultNormalize
	} = options

	const dest = './mod.ts'

	async function generate(
		filepath: string,
		pretreat: ReducePretreat = silence
	) {
		let content = await readTextFile(filepath)
		const infos = find(content)

		content = await reduce(
			{
				infos,
				npmCDN,
				content,
				filepath,
				normalize,
				npmSpecifiers
			},
			pretreat
		)

		await writeTextFile(filepath, content)
	}

	// clean
	await parallel([clean(dest), clean(depsDir)])

	await parallel([
		// copy files to depsDir
		copy(src, depsDir, {
			flat: true,
			filter(file) {
				return (
					file.relativePath !==
					normalizePath('src/index.ts')
				)
			}
		}),
		copy(index, './', {
			flat: true,
			rename() {
				return 'mod'
			}
		})
	])

	// scan all files
	const filepaths = await fg(`${depsDir}/**/*.ts`)
	const generatePromises = filepaths.map(filepath =>
		generate(filepath)
	)

	const destGeneratePromise = generate(dest, infos => {
		return infos.map(info => {
			return {
				...info,
				code: info.code.replace(src, depsDir)
			}
		})
	})

	generatePromises.push(destGeneratePromise)

	await parallel(generatePromises)
}

export function reduce(
	payload: ReducePayload,
	pretreat: ReducePretreat = silence
) {
	const {
		infos,
		npmCDN,
		content,
		filepath,
		normalize,
		npmSpecifiers
	} = payload

	return pretreat(infos).reduce(
		async (normalizePromise, info) => {
			return await normalize({
				npmCDN,
				filepath,
				npmSpecifiers,
				mode: info.mode,
				code: info.code,
				specifier: info.specifier,
				content: await normalizePromise,
				isNodeBuiltin: info.isNodeBuiltin
			})
		},
		Promise.resolve(content)
	)
}

const parallel = Promise.all.bind(Promise)

function silence<T>(v: T) {
	return v
}
