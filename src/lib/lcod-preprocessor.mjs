import preprocess from 'svelte-preprocess';
import * as fs from 'fs/promises';
import * as path from 'path/posix';
import YAML from 'yaml';
import crypto from 'crypto';

/**
 * @typedef PreprocessorOptions
 * @type {object}
 * @property {boolean} writeSvelte - write transpiled files to '.lcod/transpiled'
 * @property {boolean} uuid - generate UUID for components
 */

const sp = '  ';
let uuidCpt = 0;

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

    const walk = async (/** @type {string} */ p, /** @type {any} */ arr) => {
        for (const o of arr) {
            /*let slots = (await getSlots(o.component));
            slots = slots.length ? ` slots="${JSON.stringify(slots).replaceAll('"', "'")}"` : '';*/
            let slots = '';
            if (!imports.has(o.component)) {
                imports.set(o.component, await solve(o.component, filename));
            }

            let props = '';

            if (o.properties) {
                for (const k of Object.keys(o.properties)) {
                    props += ` ${k}="${o.properties[k]
                        .replaceAll('"', '&quot;')
                        .replaceAll('{', '&#123;')}"`;
                }
            }

            if (options.uuid) {
                o.uuid ??= crypto.randomUUID();
            }

            if ('uuid' in o) {
                //body += `${p}<Identifier uuid="${o.uuid}"${slots}>\n`;
                body += `${p}${sp}{@html '<!-- start-${o.uuid} -->'}\n`
            }

            if ('slots' in o) {
                body += `${p}${sp}<${o.component}${props}>\n`;
                for (const k in o.slots) {
                    if (k == 'default') {
                        await walk(`${p}${sp}${sp}`, o.slots[k]);
                    } else {
                        body += `${p}${sp}${sp}<svelte:fragment slot="${k}">\n`;
                        await walk(`${p}${sp}${sp}${sp}`, o.slots[k]);
                        body += `${p}${sp}${sp}</svelte:fragment>\n`;
                    }
                }
                body += `${p}${sp}</${o.component}>\n`;
            } else {
                body += `${p}${sp}<${o.component}${props} />\n`;
            }

            if ('uuid' in o) {
                //body += `${p}</Identifier>\n`;
                body += `${p}${sp}{@html '<!-- end-${o.uuid} -->'}\n`
            }
        }
    };
    await walk('', obj.content);
    //let txt = options.uuid ? '<script>\nimport Identifier from "$lib/Identifier.svelte";\n' : '<script>\n';
    let txt = '<script>\n';
    //let txt = '<script lang="ts">\nimport Identifier from "$lib/Identifier.svelte";\n';
    for (let entry of imports) {
        txt += `import ${entry[0]} from "${entry[1]}";\n`
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
    } else if (filename.endsWith("/palette")) {
        for (let file of [`${filename}/${component}.lcod`, `${filename}/${component}.svelte`]) {
            try {
                await fs.access(file, fs.constants.R_OK);
                return file;
            } catch (_) { }
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
    options = Object.assign({
        writeSvelte: false,
        uuid: false
    }, options);
    return preprocess(
        {
            aliases: [
                ['lcod', 'lcodLanguage']
            ],
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
                        const filepath = `.lcod/transpiled/${path.relative(path.resolve('.'), filename.replace(/^.*?\//, '/').replace(/.lcod\/Comp.svelte$/, '.svelte'))}`;
                        await fs.mkdir(path.dirname(filepath), { recursive: true });
                        await fs.writeFile(filepath, transpiled);
                    });
                }
                return { code: transpiled };
            }
        });
}