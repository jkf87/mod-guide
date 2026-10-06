// AI 답변 엔진용 사이트 안내(llms.txt): 영어 쪽 목록과 설명, 다른 언어 주소 규칙, 데이터 위치
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import stats from '../data/stats.json'

const SECTIONS: [string, string][] = [
  ['guide', 'Guide'],
  ['articles', 'In-depth articles (original data analyses, source reviews, tested tutorials)'],
  ['mods', 'Mods'],
  ['', 'More'],
]

export const GET: APIRoute = async ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://mods.guide'
  const docs = (await getCollection('docs', e => e.id.startsWith('en/') && e.id !== 'en'))
    .sort((a, b) => (a.data.sidebar?.order ?? 99) - (b.data.sidebar?.order ?? 99) || a.id.localeCompare(b.id))
  const used = new Set<string>()
  let out = `# Claude Code Mods Guide

> Unofficial community guide to Claude Code mods (function hooks plugins): what they are, how to install them safely, how to build and publish one, and a searchable directory of ${stats.total.toLocaleString('en-US')} community mods (scanned ${stats.generated.slice(0, 10)}, Claude Code ${stats.claudeVersion}). Not affiliated with Anthropic.

Every page exists in English, Korean, Japanese, Simplified Chinese, French and German: replace /en/ in a URL with /ko/, /ja/, /zh-cn/, /fr/ or /de/.
Mod directory data (JSON): ${base}/data/mods.json (source: karanb192/awesome-claude-code-mods, CC0).
`
  for (const [key, label] of SECTIONS) {
    const items = docs.filter(e => !used.has(e.id) && (key ? e.id.startsWith(`en/${key}/`) : true))
    if (items.length === 0) continue
    out += `\n## ${label}\n\n`
    for (const e of items) {
      used.add(e.id)
      out += `- [${e.data.title}](${base}/${e.id}/): ${e.data.description ?? ''}\n`
    }
  }
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
