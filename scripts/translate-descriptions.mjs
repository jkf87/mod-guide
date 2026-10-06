#!/usr/bin/env node
// mod 설명(영어)을 사이트 언어로 옮겨 scripts/cache/desc-<lang>.json에 쌓는다 (영어 문장 → 번역).
// 같은 문장은 한 번만 옮기고, 캐시에 있는 문장은 건너뛴다. 번역은 claude -p(Sonnet)로 묶음 단위로 한다.
//   node scripts/translate-descriptions.mjs [ko ja zh-CN fr de]
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const LANGS = { ko: 'Korean (해요체, 짧고 자연스러운 UI 문장)', ja: 'Japanese (です・ます調)', 'zh-CN': 'Simplified Chinese', fr: 'French', de: 'German (du-Form)' }
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LANGS)
const BATCH = 100
const CONCURRENCY = 4

const mods = JSON.parse(fs.readFileSync(path.join('public', 'data', 'mods.json'), 'utf8'))
const texts = [...new Set(mods.map(m => m.d).filter(Boolean))]

// 스크립트에서 claude -p를 격리해 부른다 (--bare는 로그인이 끊겨서 쓰지 않는다)
function claude(prompt) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env }
    delete env.LOGNAME
    const child = spawn(
      'claude',
      ['-p', '--model', 'sonnet', '--tools', '', '--setting-sources', '', '--strict-mcp-config', '--disable-slash-commands', '--no-session-persistence'],
      { env, stdio: ['pipe', 'pipe', 'pipe'] },
    )
    let out = ''
    let err = ''
    child.stdout.on('data', d => (out += d))
    child.stderr.on('data', d => (err += d))
    child.on('close', code => (code === 0 ? resolve(out) : reject(new Error(`claude exited ${code}: ${err.slice(0, 300)}`))))
    child.stdin.end(prompt)
  })
}

async function translate(lang, batch) {
  const input = Object.fromEntries(batch.map((t, i) => [String(i), t]))
  const prompt = `Translate every value of this JSON object into ${LANGS[lang]}.
These are one-line descriptions of Claude Code mods (plugins) for a directory website.
Rules: keep mod names, slash commands (/foo), file names, code identifiers, product names (Claude Code, Codex, GitHub, Jev, TypeSafe), numbers and units unchanged. Write natural, concise UI text, not a literal gloss. Do not add or drop facts.
Reply with ONLY the JSON object with the same keys, no code fence, no commentary.

${JSON.stringify(input, null, 0)}`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const raw = await claude(prompt)
      const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
      const missing = batch.filter((_, i) => typeof json[String(i)] !== 'string' || json[String(i)].trim() === '')
      if (missing.length > batch.length * 0.05) throw new Error(`${missing.length} missing`)
      return batch.map((t, i) => [t, typeof json[String(i)] === 'string' ? json[String(i)].trim() : null])
    } catch (e) {
      console.log(`${lang}: batch retry ${attempt + 1} (${e.message.slice(0, 80)})`)
    }
  }
  return []
}

const jobs = []
const caches = {}
for (const lang of wanted) {
  const file = path.join('scripts', 'cache', `desc-${lang}.json`)
  caches[lang] = { file, data: fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {} }
  const todo = texts.filter(t => !caches[lang].data[t])
  console.log(`${lang}: ${todo.length}/${texts.length} to translate`)
  for (let i = 0; i < todo.length; i += BATCH) jobs.push([lang, todo.slice(i, i + BATCH)])
}
const save = lang => fs.writeFileSync(caches[lang].file, JSON.stringify(caches[lang].data, null, 1))
let done = 0
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  for (let job; (job = jobs.shift()); ) {
    const [lang, batch] = job
    for (const [en, tr] of await translate(lang, batch)) if (tr) caches[lang].data[en] = tr
    save(lang)
    console.log(`batch ${++done} done (${lang}), ${jobs.length} left`)
  }
}))
for (const lang of wanted) console.log(`${lang}: ${Object.keys(caches[lang].data).length}/${texts.length}`)
