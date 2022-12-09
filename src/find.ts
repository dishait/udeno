import {
	isNodeBuiltin,
	findExports as _findExports,
	findStaticImports as _findStaticImports
} from 'mlly'
import type { Module } from './type'
import type { ESMExport, StaticImport } from 'mlly'

function transform(
	modules: Array<ESMExport | StaticImport>
) {
	return modules
		.filter(v => v.specifier)
		.map(v => {
			return {
				code: v.code,
				specifier: v!.specifier,
				isNodeBuiltin: isNodeBuiltin(v.specifier)
			} as Module
		})
}

export function findExports(content: string) {
	return transform(_findExports(content))
}

export function findStaticImports(content: string) {
	return transform(_findStaticImports(content))
}
