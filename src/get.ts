import mem from 'mem'
import { get } from 'node:https'

export const getRemoteStdVersion = mem(function () {
	return new Promise((resolve, reject) => {
		get('https://deno.land/std', res => {
			resolve(res.headers.location!.slice(5))
			res.resume() // ensure unlock
		}).once('error', e => {
			reject(e)
		})
	})
})
