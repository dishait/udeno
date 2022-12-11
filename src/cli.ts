import mri from 'mri'
import consola from 'consola'
import { readPackageUp } from 'read-pkg-up'
import { udeno, transformReadMe } from './index'

async function main() {
	const _argv = process.argv.slice(2)

	const args = mri(_argv, {
		boolean: ['WithTransformReadMe', 'onlyTransformReadMe'],
		alias: {
			transformReadMe: 'wtr',
			onlyTransformReadMe: 'otr'
		}
	})

	// @ts-ignore
	if (
		args.WithTransformReadMe ||
		args.onlyTransformReadMe
	) {
		const pkg = await readPackageUp()
		await transformReadMe({
			path: 'README.md',
			version: pkg?.packageJson!.version
		})
	}

	if (!args.onlyTransformReadMe) {
		await udeno()
	}
}

main().catch(err => {
	consola.withTag('udeno').error(err.message)
})
