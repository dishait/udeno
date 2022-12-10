import copy from 'cpy'
import defu from 'defu'
import destr from 'destr'
import fg from 'fast-glob'
import consola from 'consola'
import { find } from './find'
import type { IOptions } from './type'
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

const vscodeSettingFilePath = '.vscode/setting.json'

export async function udeno(
	options: Partial<IOptions> = {}
) {
	const {
		src = 'src',
		vscode = true,
		depsDir = 'deps',
		npmSpecifiers = true,
		index = 'src/index.ts',
		npmCDN = 'https://esm.sh/',
		normalize = defaultNormalize,
		vscodeSetting
	} = options

	log.start(`transform`)

	if (vscode) {
		await generateVscodeSetting(
			dest,
			depsDir,
			vscodeSetting as IOptions['vscodeSetting']
		)

		log.info(`vscode setting generated`)
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
			return await infos.reduce(async (_content, info) => {
				return await normalize({
					npmCDN,
					filepath,
					npmSpecifiers,
					content: await _content,
					...info
				})
			}, Promise.resolve(content))
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

			return await newInfos.reduce(
				async (_content, info) => {
					return await normalize({
						npmCDN,
						filepath,
						npmSpecifiers,
						content: await _content,
						...info
					})
				},
				Promise.resolve(newContent)
			)
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

async function generateVscodeSetting(
	dest: string,
	depsDir: string,
	vscodeSetting: IOptions['vscodeSetting']
) {
	await ensureFile(vscodeSettingFilePath)

	const finalVscodeSetting = defu(
		{
			'deno.enable': true,
			'deno.enablePaths': [dest, depsDir]
		},
		vscodeSetting
	)

	const content = await readTextFile(vscodeSettingFilePath)

	const setting = defu(
		destr(content),
		finalVscodeSetting
	) as IOptions['vscodeSetting']

	setting['deno.enablePaths'] = [
		...new Set(setting['deno.enablePaths'])
	]

	await writeTextFile(
		vscodeSettingFilePath,
		JSON.stringify(setting, null, 2)
	)
}
