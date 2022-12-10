export interface IOptions {
	/**
	 * @default "src/index.ts"
	 */
	index: string
	/**
	 * @default "deps"
	 */
	depsDir: string
	/**
	 * @default true
	 */
	npmSpecifiers: boolean

	/**
	 * @default "src"
	 */
	src: string
	/**
	 * @default "https://esm.sh/"
	 */
	npmCDN: string
	vscode: Vscode
	/**
	 * @default defaultNormalize
	 */
	normalize: (payload: NormalizePayload) => Promise<string>
}

export type Vscode = Partial<{
	disable: boolean
	path: string
	settings: Partial<{
		'deno.enable': boolean
		'deno.enablePaths': string[]
	}>
}>

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
