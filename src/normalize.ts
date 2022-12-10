import type { NormalizePayload } from './type'
import { getPackageInfo, isPackageExists } from 'local-pkg'

export async function defaultNormalize(
	payload: NormalizePayload
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
		const nodeBuiltin = specifier.replace('node:', '')

		return replace(
			`https://deno.land/std/node/${nodeBuiltin}.ts`
		)
	}

	if (isPackageExists(specifier)) {
		const packageInfo = await getPackageInfo(specifier)

		const version = packageInfo?.version

		if (npmSpecifiers) {
			return replace(`npm:${specifier}@${version}`)
		}

		return replace(
			`${normalizeUrl(npmCDN)}${specifier}@${version}`
		)
	}
	return replace(`${specifier}.ts`)
}

export function normalizeUrl(cdn: string) {
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
