import mri from 'mri'
import { log } from './shared'
import { readPackageUp } from 'read-pkg-up'
import { cyan, blue, magenta, bold } from 'colorette'
import {
	udeno,
	transformReadMe as _transformReadMe
} from './index'

async function transformReadMe() {
	const pkg = await readPackageUp()
	await _transformReadMe({
		path: 'README.md',
		version: pkg?.packageJson!.version
	})
}

async function main() {
	const _argv = process.argv.slice(2)

	const args = mri(_argv, {
		boolean: ['withTransformReadMe', 'onlyTransformReadMe'],
		alias: {
			withTransformReadMe: 'wtr',
			onlyTransformReadMe: 'otr'
		}
	})

	if (args.h || args.help) {
		return showHelp()
	}

	if (
		args.onlyTransformReadMe ||
		args.withTransformReadMe
	) {
		await transformReadMe()
	}

	if (!args.onlyTransformReadMe) {
		await udeno()
	}
}

main().catch(err => {
	log.error(err.message)
})

function showHelp() {
	const sections: string[] = []

	const metas = [
		{
			alias: '--wtr',
			usage: '--withTransformReadMe',
			description: 'with transform readme version'
		},
		{
			alias: '--otr',
			usage: '--onlyTransformReadMe',
			description: 'only transform readme version'
		}
	]

	metas.forEach(meta => {
		sections.push(
			magenta('> ') +
				cyan(meta.usage) +
				' or ' +
				cyan(meta.alias)
		)

		sections.push('   ' + meta.description)
	})

	sections.unshift(`${bold(blue('args help'))}`)

	log.log(sections.join('\n\n') + '\n')
}
