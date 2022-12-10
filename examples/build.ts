import { udeno } from 'udeno'

udeno({
	vscode: {
		path: '../.vscode',
		settings: {
			'deno.enablePaths': [
				'./examples/mod',
				'./examples/deps'
			]
		}
	}
})
