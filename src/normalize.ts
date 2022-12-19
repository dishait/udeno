import consola from 'consola'
import type { NormalizePayload } from './type'
import { getPackageInfo, isPackageExists } from 'local-pkg'
import { getRemoteStdVersion } from './get'

export async function defaultNormalize(
	payload: NormalizePayload
) {
	let {
		code,
		npmCDN,
		content,
		specifier,
		stdVersion,
		isNodeBuiltin,
		npmSpecifiers
	} = payload

	const replace = createReplace(content, code, specifier)

	if (isNodeBuiltin) {
		const nodeBuiltin = specifier.replace('node:', '')

		if (stdVersion === 'autoGetRemote') {
			stdVersion = (await getRemoteStdVersion()) as string
		}

		if (!stdVersion) {
			return replace(
				`https://deno.land/std/node/${nodeBuiltin}.ts`
			)
		}

		return replace(
			`https://deno.land/std@${stdVersion}/node/${nodeBuiltin}.ts`
		)
	}

	if (specifier.startsWith('./')) {
		return replace(`${specifier}.ts`)
	}

	const packageExists = isPackageExists(specifier, {
		paths: [process.cwd()]
	})
	if (packageExists) {
		const packageInfo = await getPackageInfo(specifier, {
			paths: [process.cwd()]
		})

		const version = packageInfo?.version

		if (npmSpecifiers) {
			return replace(`npm:${specifier}@${version}`)
		}

		return replace(
			`${normalizeUrl(npmCDN)}${specifier}@${version}`
		)
	} else {
		consola
			.withTag('udeno')
			.error(new Error('package is not exists'))
		process.exit(1)
	}
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
			code.replace(
				new RegExp(`${specifier}(?=['"])`),
				replaceValue
			)
		)
	}
}
