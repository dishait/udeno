export interface IOptions {
	/**
	 * @default "autoGetRemote" // The remote standard library b will be automatically obtained
	 */
	stdVersion: string
	/**
	 * @default "src/index.ts"
	 */
	index: string
	/**
	 * @default "deps"
	 */
	depsDir: string
	/**
	 * @default false
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
	expression?: string
	isNodeBuiltin?: boolean
	mode: 'export' | 'import' | 'dynamic'
}

export type Infos = Info[]

interface File {
	content: string
	filepath: string
}

type NpmOptions = Pick<IOptions, 'npmCDN' | 'npmSpecifiers'>

type Std = Partial<Pick<IOptions, 'stdVersion'>>

export type NormalizePayload = Info &
	NpmOptions &
	File &
	Std

export type ReducePayload = NpmOptions &
	Std &
	File & {
		infos: Infos
	} & Pick<IOptions, 'normalize'>

export interface ITransformReadMePayload {
	path: string
	version?: string
}
