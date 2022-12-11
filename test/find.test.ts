import { readTextFile } from '../src/fs'
import { describe, expect, it } from 'vitest'
import {
	find,
	findExports,
	findStaticImports,
	findDynamicImports
} from '../src/find'

describe('find', async () => {
	const bar = await readTextFile('test/fixture/find/bar.ts')
	const foo = await readTextFile('test/fixture/find/foo.ts')

	it('findExports', async () => {
		expect(findExports(foo)).toMatchInlineSnapshot(`
			[
			  {
			    "code": "export { bar } from './bar'
			",
			    "isNodeBuiltin": false,
			    "mode": "export",
			    "specifier": "./bar",
			  },
			  {
			    "code": "export * from './bar'
			",
			    "isNodeBuiltin": false,
			    "mode": "export",
			    "specifier": "./bar",
			  },
			]
		`)

		expect(findExports(bar)).toMatchInlineSnapshot('[]')
	})

	it('findStaticImports', async () => {
		expect(findStaticImports(foo)).toMatchInlineSnapshot(`
			[
			  {
			    "code": "import { bar } from './bar'

			",
			    "isNodeBuiltin": false,
			    "mode": "import",
			    "specifier": "./bar",
			  },
			]
		`)

		expect(findStaticImports(bar)).toMatchInlineSnapshot(
			`
			[
			  {
			    "code": "import { format } from 'path'
			",
			    "isNodeBuiltin": true,
			    "mode": "import",
			    "specifier": "path",
			  },
			  {
			    "code": "import { detectSyntax } from 'mlly'

			",
			    "isNodeBuiltin": false,
			    "mode": "import",
			    "specifier": "mlly",
			  },
			]
		`
		)
	})

	it('findDynamicImports', async () => {
		expect(findDynamicImports(foo)).toMatchInlineSnapshot(`
			[
			  {
			    "code": "import('mlly')",
			    "isNodeBuiltin": false,
			    "mode": "dynamic",
			    "specifier": "mlly",
			  },
			  {
			    "code": "import('path')",
			    "isNodeBuiltin": true,
			    "mode": "dynamic",
			    "specifier": "path",
			  },
			]
		`)

		expect(findDynamicImports(bar)).toMatchInlineSnapshot(
			'[]'
		)
	})

	it('find', async () => {
		expect(find(foo)).toMatchInlineSnapshot(`
			[
			  {
			    "code": "export { bar } from './bar'
			",
			    "isNodeBuiltin": false,
			    "mode": "export",
			    "specifier": "./bar",
			  },
			  {
			    "code": "export * from './bar'
			",
			    "isNodeBuiltin": false,
			    "mode": "export",
			    "specifier": "./bar",
			  },
			  {
			    "code": "import { bar } from './bar'

			",
			    "isNodeBuiltin": false,
			    "mode": "import",
			    "specifier": "./bar",
			  },
			  {
			    "code": "import('mlly')",
			    "isNodeBuiltin": false,
			    "mode": "dynamic",
			    "specifier": "mlly",
			  },
			  {
			    "code": "import('path')",
			    "isNodeBuiltin": true,
			    "mode": "dynamic",
			    "specifier": "path",
			  },
			]
		`)

		expect(find(bar)).toMatchInlineSnapshot(`
			[
			  {
			    "code": "import { format } from 'path'
			",
			    "isNodeBuiltin": true,
			    "mode": "import",
			    "specifier": "path",
			  },
			  {
			    "code": "import { detectSyntax } from 'mlly'

			",
			    "isNodeBuiltin": false,
			    "mode": "import",
			    "specifier": "mlly",
			  },
			]
		`)
	})
})
