#!/usr/bin/env node
// 커뮤니티 카탈로그(karanb192/awesome-claude-code-mods, CC0)의 mods.json을 받아
// 디렉터리 페이지가 쓰는 가벼운 public/data/mods.json과 src/data/stats.json을 만든다.
//   node scripts/build-mods-data.mjs [로컬 mods.json 경로]
import fs from 'node:fs'
import path from 'node:path'

const SOURCE = 'https://raw.githubusercontent.com/karanb192/awesome-claude-code-mods/main/data/mods.json'
const local = process.argv[2]
const raw = local ? JSON.parse(fs.readFileSync(local, 'utf8')) : await (await fetch(SOURCE)).json()

// 분류: 이름(3점)·설명(1점)에서 각 분류의 단어가 몇 번 나오는지 세어 가장 높은 분류를 고른다
const RULES = {
  fun: /\b(game|pet|doom|arcade|pixel|music|sound|meditat\w*|breath\w*|crab|wolf|tamagotchi|fortune|joke|confetti|celebrat\w*|snake|tetris|play)\b/gi,
  safety: /\b(secret|secrets|redact\w*|guard\w*|gate|block\w*|deny|denies|permission\w*|risky|danger\w*|security|privacy|pii|mask\w*|blast|sandbox\w*|protect\w*|audit\w*|policy|approv\w*|destructive)\b/gi,
  usage: /\b(usage|quota|tokens?|cost|spend|budget|meter|rate.?limits?|context|cache|burn|billing|limits?|5.hour|weekly)\b/gi,
  git: /\b(git|pull requests?|prs?|ci|github|actions|deploy\w*|commits?|branch\w*|worktrees?|merge\w*)\b/gi,
  agents: /\b(subagents?|agents|council|router|routing|swarm|teammates?|codex|delegat\w*|parallel|race|orchestrat\w*|lanes?)\b/gi,
  memory: /\b(memory|memories|compact\w*|remember\w*|knowledge|notes?|todos?|tasks?|pinboard|journal|handoff|recall|resume)\b/gi,
  interface: /\b(render\w*|markdown|mermaid|themes?|skins?|browser|preview|pane|file.?tree|explorer|images?|diff|status.?line|spinner|band|toast|transcript|box.?art|colou?r\w*)\b/gi,
}
const ORDER = ['safety', 'usage', 'git', 'agents', 'memory', 'interface', 'fun']
const categoryOf = m => {
  let best = 'other'
  let bestScore = 0
  for (const cat of ORDER) {
    const re = RULES[cat]
    const score = 3 * (String(m.name).replace(/[-_]/g, ' ').match(re) ?? []).length + (String(m.description).match(re) ?? []).length
    if (score > bestScore) {
      best = cat
      bestScore = score
    }
  }
  return best
}

const clip = (s, n) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t
}

// README에서 찾은 그림 (scripts/fetch-mod-images.mjs가 만든 캐시)
const IMAGES = path.join('scripts', 'cache', 'images.json')
const images = fs.existsSync(IMAGES) ? JSON.parse(fs.readFileSync(IMAGES, 'utf8')) : {}

// 화면 어디에 그리는지: P 옆 창, A 입력창 위 띠, M 대화 메시지, S 스피너·힌트, T 상태줄
const drawsOf = m => {
  const d = new Set((m.draws ?? []).flatMap(x => String(x).split('|')))
  let f = ''
  if (d.has('Pane')) f += 'P'
  if (d.has('AbovePrompt')) f += 'A'
  if (['AssistantMessage', 'UserMessage', 'ToolUse', 'ToolResult', 'ToolGroup', 'CommandOutput', 'InfoNotice'].some(x => d.has(x))) f += 'M'
  if (['Spinner', 'PromptHint', 'SessionMode', 'TurnDuration', 'ToolProgress'].some(x => d.has(x))) f += 'S'
  if ((m.calls ?? []).includes('$.ui.status')) f += 'T'
  return f
}

const mods = raw.mods
  .filter(m => (m.kind === 'mod' || m.kind === 'builtin') && !m.archived && !m.duplicateOf && ['passed', 'warnings'].includes(m.validate?.status))
  .map(m => ({
    n: m.name,
    r: m.repo,
    u: m.url,
    a: m.author || m.repo.split('/')[0],
    d: clip(m.description, 240),
    s: m.stars ?? 0,
    l: m.license ?? null,
    lv: m.reach?.level ?? 0,
    rl: m.reach?.labels ?? [],
    c: categoryOf(m),
    b: m.kind === 'builtin' ? 1 : 0,
    p: (m.pushedAt ?? '').slice(0, 10),
    cr: (m.createdAt ?? '').slice(0, 10),
    img: typeof images[`${m.repo}:${m.path ?? ''}`] === 'string' ? images[`${m.repo}:${m.path ?? ''}`] : null,
    dw: drawsOf(m),
    w: m.validate?.status === 'warnings' ? 1 : 0,
  }))
  .sort((x, y) => y.b - x.b || y.s - x.s || x.n.localeCompare(y.n))

fs.writeFileSync(path.join('public', 'data', 'mods.json'), JSON.stringify(mods))

// 언어별 설명: mods.json과 같은 순서의 배열 (번역이 없으면 null → 영어 원문을 쓴다)
for (const lang of ['ko', 'ja', 'zh-CN', 'fr', 'de']) {
  const file = path.join('scripts', 'cache', `desc-${lang}.json`)
  const tr = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
  const out = mods.map(m => tr[m.d] ?? null)
  fs.writeFileSync(path.join('public', 'data', `desc-${lang}.json`), JSON.stringify(out))
  console.log(`desc-${lang}: ${out.filter(Boolean).length}/${mods.length}`)
}
const byCategory = {}
for (const m of mods) byCategory[m.c] = (byCategory[m.c] ?? 0) + 1
const stats = { generated: raw.generated, claudeVersion: raw.claudeVersion, total: mods.length, warnings: mods.filter(m => m.w).length, repos: new Set(mods.map(m => m.r)).size, byCategory }
fs.writeFileSync(path.join('src', 'data', 'stats.json'), JSON.stringify(stats, null, 2))
console.log(stats)
