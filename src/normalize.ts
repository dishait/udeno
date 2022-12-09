import { getPackageInfo, isPackageExists } from 'local-pkg'
import type {
	BaseNormalizePayload,
	ImportNormalizePayload,
	ExportNormalizePayload
} from './type'

export function defaultImportNormalize(
	payload: ImportNormalizePayload
) {
	const { content, _import, npmSpecifiers, npmCDN } =
		payload

	const { isNodeBuiltin, code, specifier } = _import

	return baseNormalize({
		code,
		npmCDN,
		content,
		specifier,
		npmSpecifiers,
		isNodeBuiltin
	})
}

export function defaultExportNormalize(
	payload: ExportNormalizePayload
) {
	const { content, _export, npmSpecifiers, npmCDN } =
		payload

	const { isNodeBuiltin, code, specifier } = _export

	return baseNormalize({
		code,
		npmCDN,
		content,
		specifier,
		isNodeBuiltin,
		npmSpecifiers
	})
}

export async function baseNormalize(
	payload: BaseNormalizePayload
) {
	const {
		code,
		npmCDN,
		content,
		specifier,
		isNodeBuiltin,
		npmSpecifiers
	} = payload
	const replace = createReplace(content, code, specifier)

	if (isNodeBuiltin) {
		return replace(
			`https://deno.land/std/node/${specifier}.ts`
		)
	}

	if (isPackageExists(specifier)) {
		const packageInfo = await getPackageInfo(specifier)

		const version = packageInfo?.version

		if (npmSpecifiers) {
			return replace(`npm:${specifier}@${version}`)
		}

		return replace(
			`${normalizeNpmCDN(npmCDN)}${specifier}@${version}`
		)
	}
	return replace(`${specifier}.ts`)
}

export function normalizeNpmCDN(cdn: string) {
	return /\/$/.test(cdn) ? cdn : cdn + '/'
}

export function createReplace(
	content: string,
	code: string,
	specifier: string
) {
	return function replace(replaceValue: string) {
		return content.replace(
			code,
			code.replace(specifier, replaceValue)
		)
	}
}
