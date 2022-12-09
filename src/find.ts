import {
	isNodeBuiltin,
	findExports as _findExports,
	findStaticImports as _findStaticImports
} from 'mlly'
import type { Info } from './type'
import type { ESMExport, StaticImport } from 'mlly'

function transform(
	mode: Info['mode'],
	infos: Array<ESMExport | StaticImport>
) {
	return infos
		.filter(v => v.specifier)
		.map(v => {
			return {
				mode,
				code: v.code,
				specifier: v!.specifier,
				isNodeBuiltin: isNodeBuiltin(v.specifier)
			} as Info
		})
}

export function findExports(content: string) {
	return transform('export', _findExports(content))
}

export function findStaticImports(content: string) {
	return transform('import', _findStaticImports(content))
}

export function find(content: string) {
	const exportInfos = findExports(content)
	const importInfos = findStaticImports(content)
	return [...exportInfos, ...importInfos]
}
