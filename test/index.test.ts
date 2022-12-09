import { reduce } from '../src'
import { find } from '../src/find'
import { readTextFile } from '../src/fs'
import { describe, expect, it } from 'vitest'
import { defaultNormalize } from '../src/normalize'

describe('normalize', async () => {
	const npmCDN = 'https://esm.sh/'
	const fooPath = 'test/fixture/find/foo.ts'
	const barPath = 'test/fixture/find/bar.ts'

	const fooContent = await readTextFile(fooPath)
	const barContent = await readTextFile(barPath)

	it('reduce', async () => {
		const fooInfos = find(fooContent)
		const barInfos = find(barContent)

		const normalizedFooContent = await reduce({
			npmCDN,
			infos: fooInfos,
			filepath: fooPath,
			content: fooContent,
			npmSpecifiers: true,
			normalize: defaultNormalize
		})

		expect(normalizedFooContent).toMatchInlineSnapshot(
			`
			"import { bar } from './bar.ts'

			console.log(bar)

			export { bar } from './bar.ts'

			export * from './bar.ts'
			"
		`
		)

		const normalizedBarContent = await reduce({
			npmCDN,
			infos: barInfos,
			filepath: barPath,
			content: barContent,
			npmSpecifiers: true,
			normalize: defaultNormalize
		})

		expect(normalizedBarContent).toMatchInlineSnapshot(
			`
			"import { format } from 'https://deno.land/std/node/path.ts'
			import { detectSyntax } from 'npm:mlly@1.0.0'

			export const bar = 1
			"
		`
		)

		const normalizedBarContentWithCDN = await reduce({
			npmCDN,
			infos: barInfos,
			filepath: barPath,
			content: barContent,
			npmSpecifiers: false,
			normalize: defaultNormalize
		})

		expect(
			normalizedBarContentWithCDN
		).toMatchInlineSnapshot(
			`
			"import { format } from 'https://deno.land/std/node/path.ts'
			import { detectSyntax } from 'https://esm.sh/mlly@1.0.0'

			export const bar = 1
			"
		`
		)
	})
})
