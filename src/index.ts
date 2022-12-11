import copy from 'cpy'
import destr from 'destr'
import fg from 'fast-glob'
import { defu } from 'defu'
import consola from 'consola'
import { find } from './find'

import type {
	IOptions,
	ReducePayload,
	Vscode
} from './type'
import { defaultNormalize } from './normalize'
import { normalize as normalizePath } from 'node:path'
import {
	clean,
	ensureFile,
	readTextFile,
	writeTextFile,
	createTransformTextFile
} from './fs'

const dest = 'mod.ts'

const log = consola.withTag('udeno')

export async function udeno(
	options: Partial<IOptions> = {}
) {
	const {
		src,
		index,
		npmCDN,
		vscode,
		depsDir,
		normalize,
		stdVersion,
		npmSpecifiers
	} = defu(options, {
		src: 'src',
		depsDir: 'deps',
		npmSpecifiers: true,
		index: 'src/index.ts',
		npmCDN: 'https://esm.sh/',
		normalize: defaultNormalize,
		vscode: {
			disable: false,
			path: '.vscode',
			settings: {
				'deno.enable': true
			}
		}
	}) as IOptions

	log.start(`transform`)

	if (!vscode.disable) {
		if (!vscode['settings']!['deno.enablePaths']) {
			vscode['settings']!['deno.enablePaths'] = [
				dest,
				depsDir
			]
		}

		await generateVscodeSetting(vscode)

		log.info(`vscode settings generated`)
	}

	// clean
	await parallel([clean(dest), clean(depsDir)])

	log.info(`${dest} and ${depsDir}/**/* was cleaned`)

	// copy files
	await parallel([
		copy(src, depsDir, {
			flat: true,
			filter(file) {
				return file.relativePath !== normalizePath(index)
			}
		}),
		copy(index, './', {
			flat: true,
			rename() {
				return 'mod'
			}
		})
	])

	log.info(`${dest} and ${depsDir}/**/* was copyed`)

	// scan all files
	const filepaths = await fg(`${depsDir}/**/*.ts`)

	log.info(`scan all files on ${depsDir}`)

	const transformDepFiles = createTransformTextFile(
		async (filepath, content) => {
			const infos = find(content)
			return reduce({
				infos,
				npmCDN,
				content,
				filepath,
				normalize,
				stdVersion,
				npmSpecifiers
			})
		}
	)

	const transformDestFile = createTransformTextFile(
		async (filepath, content) => {
			const infos = find(content)

			const newInfos = infos.map(info => {
				return {
					...info,
					code: info.code.replace('./', `./${depsDir}/`),
					specifier: info.specifier.replace(
						'./',
						`./${depsDir}/`
					)
				}
			})

			const newContent = newInfos.reduce(
				(_content, info, currentIndex) => {
					const originCode = infos[currentIndex].code
					return _content.replace(originCode, info.code)
				},
				content
			)

			return reduce({
				npmCDN,
				filepath,
				normalize,
				stdVersion,
				npmSpecifiers,
				infos: newInfos,
				content: newContent
			})
		}
	)
	// transform all files
	const transformPromises = filepaths.map(filepath => {
		return transformDepFiles(filepath)
	})
	transformPromises.push(transformDestFile(dest))
	await parallel(transformPromises)

	log.success('transform success')
}

const parallel = Promise.all.bind(Promise)

export async function reduce(payload: ReducePayload) {
	const {
		infos,
		npmCDN,
		content,
		filepath,
		normalize,
		stdVersion,
		npmSpecifiers
	} = payload
	return await infos.reduce(async (_content, info) => {
		return await normalize({
			npmCDN,
			filepath,
			stdVersion,
			npmSpecifiers,
			content: await _content,
			...info
		})
	}, Promise.resolve(content))
}

export async function generateVscodeSetting(
	vscode: Vscode
) {
	const { path } = vscode

	consola.log(path)
	const settingsFilePath = `${path}/settings.json`

	await ensureFile(settingsFilePath!)

	const originSettingText = await readTextFile(
		settingsFilePath
	)

	const settings = defu(
		destr(originSettingText),
		vscode.settings
	) as Vscode['settings']

	settings!['deno.enablePaths'] = [
		...new Set(settings!['deno.enablePaths'])
	]

	const settingsText = JSON.stringify(settings, null, 2)

	await writeTextFile(settingsFilePath, settingsText)
}

export * from './fs'
export * from './type'
export * from './find'
export * from './normalize'
