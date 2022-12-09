export interface IGenerateOptions {
	/**
	 * @default src/index.ts
	 */
	index: string
	/**
	 * @default deps
	 */
	depsDir: string
	/**
	 * @default mod.ts
	 */
	dest: string
	/**
	 * @default true
	 */
	npmSpecifiers: boolean

	/**
	 * @default src
	 */
	src: string
	/**
	 * https://esm.sh/
	 */
	npmCDN: string
	importNormalize: (
		payload: ImportNormalizePayload
	) => Promise<string>
	exportNormalize: (
		payload: ExportNormalizePayload
	) => Promise<string>
}

export type Module = {
	code: string
	specifier: string
	isNodeBuiltin: boolean
}

export type ImportNormalizePayload = {
	content: string
	filepath: string
	_import: Module
	npmCDN: string
	npmSpecifiers?: boolean
}

export type ExportNormalizePayload = Omit<
	ImportNormalizePayload,
	'_import'
> & { _export: Module }

export type BaseNormalizePayload = Omit<
	ImportNormalizePayload,
	'_import' | 'filepath'
> &
	Module
