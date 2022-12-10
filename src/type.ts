export interface IOptions {
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

	/**
	 * @default src
	 */
	src: string
	/**
	 * https://esm.sh/
	 */
	npmCDN: string

	/**
	 * @default true
	 */
	vscode: boolean

	/**
	 * @default {
	 * 'deno.enable': true,
	 * 'deno.enablePaths': ["mod.ts", "deps"]
	 * }
	 */
	vscodeSetting: {
		'deno.enable': boolean
		'deno.enablePaths': string[]
	}

	normalize: (payload: NormalizePayload) => Promise<string>
}

export type Info = {
	code: string
	specifier: string
	isNodeBuiltin: boolean
	mode: 'export' | 'import'
}

export type Infos = Info[]

interface File {
	content: string
	filepath: string
}

type NpmOptions = Pick<IOptions, 'npmCDN' | 'npmSpecifiers'>

export type NormalizePayload = Info & NpmOptions & File
