# udeno

生产环境下为 node 包提供开箱即用的 [deno](https://deno.land/x) 支持

<br />

# README

[English](./README.md) | 简体中文

<br />

## Usage

### install

```shell
npm i udeno -g
```

### cli

在你的包根目录

```shell
udeno
```

```shell
udeno --help
```

<br />

### program

```ts
import { udeno, transformReadMe } from 'udeno'

udeno() // 主要转换

transformReadMe() //转换 readme 版本
```

#### config

```ts
import { udeno } from 'udeno'

import { udeno } from 'udeno'

udeno({
	src: 'src', // 源码目录
	depsDir: 'deps', // 输出目录
	npmSpecifiers: true, // 开启 npm specifiers，暂时不可用
	index: 'src/index.ts', // 源码入口文件
	npmCDN: 'https://esm.sh/', // npm 包 cdn
	normalize: defaultNormalize, // 允许你自动规范化
	vscode: {
		disable: false, // 禁用 vscode 生成
		path: '.vscode', // 你的 vscode 配置路径
		//  你要生成的 vscode 配置
		settings: {
			'deno.enable': true,
			'deno.enablePaths': ['mod.ts', 'deps'] // 默认是自动生成的，不需要关心
		}
	}
})
```

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).

<br />
