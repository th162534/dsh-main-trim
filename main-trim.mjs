/**
 * main-trim — 只对主会话（standard preset）收窄继承工具。
 *
 * 为什么不是 disable 插件：双面插件的浏览器半身与宿主半身绑在同一 Loader 条目上，
 * 关掉一行，UI 也一起消失（blender 那次就是这么丢的）。
 * 为什么不是 allow 白名单：restrict 只认「继承层」，preset 自己注册的 fs/pwsh/skill/todo
 * 不在 restrictableNames 里，白名单会把它们一并过滤掉（translator 曾从 64 掉到 5）。
 * 所以：黑名单 + 逐个 name 调用（restrict 对未知名字整批原子失败）。
 */
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

function loadDeny() {
	try {
		const raw = JSON.parse(readFileSync(join(here, 'deny.json'), 'utf8'));
		return Array.isArray(raw?.deny) ? raw.deny.filter((n) => typeof n === 'string') : [];
	} catch (error) {
		console.warn(`[main-trim] deny.json unreadable: ${error?.message ?? error}`);
		return [];
	}
}

export const name = 'main-trim';
export const inject = ['tools'];

export function apply(ctx) {
	const deny = loadDeny();
	let blocked = 0;
	const skipped = [];
	for (const toolName of deny) {
		try {
			ctx.tools.restrict({ deny: [toolName] });
			blocked += 1;
		} catch (error) {
			skipped.push(toolName);
		}
	}
	const line = `[main-trim] ${new Date().toISOString()} blocked=${blocked}/${deny.length} skipped=${skipped.length}${skipped.length ? ' -> ' + skipped.join(',') : ''}`;
	console.log(line);
	try {
		appendFileSync('C:/Users/ASUS/.dsh/main-trim.log', `${line}\n`);
	} catch (error) {
		console.warn(`[main-trim] log write failed: ${error?.message ?? error}`);
	}
}
