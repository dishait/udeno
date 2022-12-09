import { readTextFile } from '../src/fs'
import { describe, expect, it } from 'vitest'
import { findExports, findStaticImports } from '../src/find'
import {
	defaultExportNormalize,
	defaultImportNormalize
} from '../src/normalize'
import { Module } from '../src/type'

describe('normalize', async () => {
	const npmCDN = 'https://esm.sh/'
	const fooPath = 'test/fixture/find/foo.ts'
	const barPath = 'test/fixture/find/bar.ts'

	const fooContent = await readTextFile(fooPath)
	const barContent = await readTextFile(barPath)

	it('defaultExportNormalize', async () => {
		const fooModuleExports = findExports(fooContent)
		const barModuleExports = findExports(barContent)

		function normalize(
			modules: Module[],
			filepath: string,
			content: string
		) {
			return modules.reduce(async (p, c) => {
				return await defaultExportNormalize({
					filepath,
					content: await p,
					_export: c,
					npmCDN
				})
			}, Promise.resolve(content))
		}

		const lastFooContent = await normalize(
			fooModuleExports,
			fooPath,
			fooContent
		)

		expect(lastFooContent).toMatchInlineSnapshot(`
			"import { bar } from './bar'

			console.log(bar)

			export { bar } from './bar.ts'

			export * from './bar.ts'
			"
		`)

		const lastBarContent = await normalize(
			barModuleExports,
			barPath,
			barContent
		)

		expect(lastBarContent).toMatchInlineSnapshot(`
			"import { format } from 'path'
			import { detectSyntax } from 'mlly'

			export const bar = 1
			"
		`)
	})

	it('defaultImportNormalize', async () => {
		const fooModuleImports = findStaticImports(fooContent)
		const barModuleImports = findStaticImports(barContent)

		function normalize(
			modules: Module[],
			filepath: string,
			content: string
		) {
			return modules.reduce(async (p, c) => {
				return await defaultImportNormalize({
					filepath,
					content: await p,
					_import: c,
					npmCDN
				})
			}, Promise.resolve(content))
		}

		const lastFooContent = await normalize(
			fooModuleImports,
			fooPath,
			fooContent
		)

		expect(lastFooContent).toMatchInlineSnapshot(`
			"import { bar } from './bar.ts'

			console.log(bar)

			export { bar } from './bar'

			export * from './bar'
			"
		`)

		const lastBarContent = await normalize(
			barModuleImports,
			barPath,
			barContent
		)

		expect(lastBarContent).toMatchInlineSnapshot(`
			"import { format } from 'https://deno.land/std/node/path.ts'
			import { detectSyntax } from 'https://esm.sh/mlly@1.0.0'

			export const bar = 1
			"
		`)
	})
})
