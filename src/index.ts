interface Options {
	/**
	 * @default src/index.ts
	 */
	index: string
	/**
	 * @default deps
	 */
	depsDir: string
	/**
	 * @default true
	 */
	npmSpecifiers: boolean

	importNormalize: (
		filepath: string,
		_import: string
	) => string
	exportNormalize: (
		filepath: string,
		_export: string
	) => string
}

export function generate(options: Options) {}
