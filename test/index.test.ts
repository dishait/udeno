import { describe, expect, it } from 'vitest'
import {
	find,
	reduce,
	readTextFile,
	defaultNormalize
} from '../src'

describe('udeno', async () => {
	const npmCDN = 'https://esm.sh/'
	const fooPath = 'test/fixture/find/foo.ts'
	const barPath = 'test/fixture/find/bar.ts'

	const fooContent = await readTextFile(fooPath)
	const barContent = await readTextFile(barPath)

	it('normalize', async () => {
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

			const mlly = await import('npm:mlly@1.0.0')
			const path = await import('https://deno.land/std/node/path.ts')

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
