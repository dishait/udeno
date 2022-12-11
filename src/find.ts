import {
	isNodeBuiltin,
	findExports as _findExports,
	findStaticImports as _findStaticImports,
	findDynamicImports as _findDynamicImports
} from 'mlly'
import type { Info } from './type'

function transformFind(
	mode: Info['mode'],
	infos: Partial<Info>[]
) {
	return infos
		.filter(v => v.specifier || v.expression)
		.map(v => {
			let specifier = v.specifier || v.expression
			specifier = specifier?.replace(/['"](.*)['"]/, '$1')
			return {
				mode,
				specifier,
				code: v.code,
				isNodeBuiltin: isNodeBuiltin(specifier)
			} as Info
		})
}

export function findExports(code: string) {
	return transformFind('export', _findExports(code))
}

export function findStaticImports(code: string) {
	return transformFind('import', _findStaticImports(code))
}

export function findDynamicImports(code: string) {
	return transformFind('dynamic', _findDynamicImports(code))
}

export function find(code: string) {
	const exportInfos = findExports(code)
	const importInfos = findStaticImports(code)
	const dynamicImports = findDynamicImports(code)
	return [...exportInfos, ...importInfos, ...dynamicImports]
}
