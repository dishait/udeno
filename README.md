# udeno

provides out of the box [deno](https://deno.land/x) support for node packages in production

<br />

## Usage

### cli

in your node package root

```shell
npx udeno
```

limit CDN version in your `README.md`

```shell
npx udeno --transformReadMe
```

<br />

### program

```ts
import { udeno, transformReadMe } from 'udeno'

udeno() // primary transform

transformReadMe() // transform ReadMe version
```

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).

<br />
