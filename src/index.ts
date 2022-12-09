import copy from 'cpy'
import fg from 'fast-glob'
import type { IGenerateOptions } from './type'
import { clean, writeTextFile, readTextFile } from './fs'
import {
	defaultExportNormalize,
	defaultImportNormalize
} from './normalize'
import { findExports, findStaticImports } from './find'

export async function unbundleDeno(
	options: Partial<IGenerateOptions> = {}
) {
	const {
		src = 'src',
		dest = 'mod.ts',
		depsDir = 'deps',
		npmSpecifiers = true,
		index = 'src/index.ts',
		npmCDN = 'https://esm.sh/',
		importNormalize = defaultImportNormalize,
		exportNormalize = defaultExportNormalize
	} = options

	// clean
	await clean(dest)
	await clean(depsDir)

	// copy files to depsDir
	await copy([src, `!${index}`], depsDir)

	// scan all files
	const filepaths = await fg(`${src}/**/*.ts`)

	filepaths.forEach(async filepath => {
		let content = await readTextFile(filepath)

		const _imports = findStaticImports(content)

		content = await _imports.reduce(async (p, c) => {
			return await importNormalize({
				filepath,
				content: await p,
				_import: c,
				npmCDN,
				npmSpecifiers
			})
		}, Promise.resolve(content))

		const _exports = findExports(content)

		content = await _exports.reduce(async (p, c) => {
			return await exportNormalize({
				npmCDN,
				filepath,
				_export: c,
				npmSpecifiers,
				content: await p
			})
		}, Promise.resolve(content))

		await writeTextFile(filepath, content)
	})
}
