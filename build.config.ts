import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	failOnWarn: false, // cpy is esm-only modules，so we need to package it as an inline dependency
	declaration: true,
	entries: ['src/cli', 'src/index'],
	rollup: {
		emitCJS: true
	}
})
