import preprocess from 'svelte-preprocess';
import * as fs from 'fs/promises';
import * as path from 'path/posix';
import YAML from 'yaml';

/**
 * @typedef PreprocessorOptions
 * @type {object}
 * @property {boolean} writeSvelte - write transpiled files to '.lcod/transpiled'
 * @property {boolean} lcpath - generate lcpath for components
 */

const sp = '  ';

/**
 *
 * @param {string} str
 * @returns {string}
 */
function simpleHash(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash &= hash; // Convert to 32bit integer
	}
	return new Uint32Array([hash])[0].toString(36);
}

/**
 *
 * @param {string} content
 * @param {string} filename
 * @param {PreprocessorOptions} options
 */
async function preprocesslcod(content, filename, options) {
	const obj = YAML.parse(content);
	/** @type {any} */
	const imports = new Map();
	let body = '';

	const walk = async (
		/** @type {string} */ ind,
		/** @type {any} */ arr,
		/** @type {string|false} */ ppath
	) => {
		for (const i in arr) {
			const o = arr[i];
			let cpath = ppath;
			/*let slots = (await getSlots(o.component));
			slots = slots.length ? ` slots="${JSON.stringify(slots).replaceAll('"', "'")}"` : '';*/
			let slots = '';
			if (!imports.has(o.component)) {
				imports.set(o.component, await solve(o.component, filename));
			}

			let props = '';

			if (o.properties) {
				for (const k of Object.keys(o.properties)) {
					props += ` ${k}="${o.properties[k].replaceAll('"', '&quot;').replaceAll('{', '&#123;')}"`;
				}
			}

			if (cpath) {
				cpath += `/${i}`;
				body += `${ind}${sp}{@html '<!-- start-${cpath} -->'}\n`;
			}

			if ('slots' in o) {
				body += `${ind}${sp}<${o.component}${props}>\n`;
				for (const k in o.slots) {
					const npath = cpath ? cpath + `/:${k}` : false;
					if (k == 'default') {
						await walk(`${ind}${sp}${sp}`, o.slots[k], npath);
					} else {
						body += `${ind}${sp}${sp}<svelte:fragment slot="${k}">\n`;
						await walk(`${ind}${sp}${sp}${sp}`, o.slots[k], npath);
						body += `${ind}${sp}${sp}</svelte:fragment>\n`;
					}
				}
				body += `${ind}${sp}</${o.component}>\n`;
			} else {
				body += `${ind}${sp}<${o.component}${props} />\n`;
			}

			if (cpath) {
				body += `${ind}${sp}{@html '<!-- end-${cpath} -->'}\n`;
			}
		}
	};
	await walk('', obj.content, options.lcpath ? simpleHash(content) : false);
	let txt = '<script>\n';
	for (let entry of imports) {
		txt += `import ${entry[0]} from "${entry[1]}";\n`;
	}
	txt += `</script>\n${body}\n`;

	//console.log("txt " + txt);
	return txt;
}
/**
 *
 * @param {string} component
 * @param {string} filename
 * @return {Promise<string>}
 */
async function solve(component, filename) {
	//console.log('solve ' + component + ' in ' + filename);
	if (filename.endsWith('.lcod/Comp.svelte')) {
		return await solve(component, path.normalize(`${filename}/../palette`));
	} else if (filename.endsWith('/palette')) {
		for (let file of [`${filename}/${component}.lcod`, `${filename}/${component}.svelte`]) {
			try {
				await fs.access(file, fs.constants.R_OK);
				return file;
			} catch (_) {}
		}
	}
	if (filename != 'palette') {
		return await solve(component, path.normalize(`${filename}/../../palette`));
	}
	throw { message: `Component ${component} not found` };
}

/**
 *
 * @param {PreprocessorOptions} options
 * @returns
 */
export function configureLcodPreprocessor(options) {
	options = Object.assign(
		{
			writeSvelte: false,
			lcpath: false
		},
		options
	);
	return preprocess({
		aliases: [['lcod', 'lcodLanguage']],
		/**
		 *
		 * @param {Object} obj
		 * @param {string} obj.content
		 * @param {string} obj.filename
		 */
		async lcodLanguage({ content, filename }) {
			const transpiled = await preprocesslcod(content, filename, options);

			if (options.writeSvelte) {
				setImmediate(async () => {
					const filepath = `.lcod/transpiled/${path.relative(
						path.resolve('.'),
						filename.replace(/^.*?\//, '/').replace(/.lcod\/Comp.svelte$/, '.svelte')
					)}`;
					await fs.mkdir(path.dirname(filepath), { recursive: true });
					await fs.writeFile(filepath, transpiled);
				});
			}
			return { code: transpiled };
		}
	});
}

if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;
	const check = async (refpath, result) => {
		try {
			const ref = await fs.readFile(refpath, 'utf8');
			expect(result).toBe(ref);
		} catch (e) {
			console.error(`${refpath} file is missing or cannot be read`, e);
			await fs.mkdir(path.dirname(refpath), { recursive: true });
			await fs.writeFile(refpath, result);
			return false;
		}
		return true;
	};

	it('preprocesslcod', async () => {
		const filename = './src/palette/HelloWorld.lcod';
		const content = await fs.readFile(`${filename}/client.yaml`, 'utf8');

		let result = await preprocesslcod(content, `${filename}/Comp.svelte`, { lcpath: false });
		let ok = await check('./tests/unit/HelloWorld.svelte', result);

		result = await preprocesslcod(content, `${filename}/Comp.svelte`, { lcpath: true });
		ok &= await check('./tests/unit/HelloWorld-lcpath.svelte', result);

		if (!ok) {
			expect('create some reference files').toBe('no missing reference files');
		}
	});
}
