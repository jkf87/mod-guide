#!/usr/bin/env node
// 쪽마다 공유 미리보기 그림(1200×630)을 public/og/<id>.jpg로 만든다. 제목·설명은 각 MDX의 frontmatter에서 읽는다.
// 한·중·일 글꼴이 있는 macOS에서 Playwright(Chromium)로 그리고, 결과는 커밋한다 (빌드 서버에는 그 글꼴이 없어서).
//   CHROME=<Chromium 실행 파일> node scripts/og-images.mjs [--force]
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const pw = await import(process.env.PLAYWRIGHT ?? 'playwright')
const chromium = pw.chromium ?? pw.default.chromium
const ROOT = path.join('src', 'content', 'docs')
const OUT = path.join('public', 'og')
const force = process.argv.includes('--force')

const SECTION = {
  guide: { en: 'Guide', ko: '가이드', ja: 'ガイド', 'zh-cn': '指南', fr: 'Guide', de: 'Leitfaden' },
  articles: { en: 'In depth', ko: '심층 글', ja: '詳しく読む', 'zh-cn': '深入阅读', fr: 'En profondeur', de: 'Vertiefung' },
  mods: { en: 'Mods', ko: 'mod 둘러보기', ja: 'Mod を探す', 'zh-cn': '浏览 Mod', fr: 'Explorer les mods', de: 'Mods entdecken' },
  other: { en: 'Claude Code Mods Guide', ko: 'Claude Code Mods 가이드', ja: 'Claude Code Mods ガイド', 'zh-cn': 'Claude Code Mods 指南', fr: 'Guide des mods Claude Code', de: 'Claude Code Mods Guide' },
}
const UNOFFICIAL = { en: 'Unofficial community guide', ko: '비공식 커뮤니티 가이드', ja: '非公式コミュニティガイド', 'zh-cn': '非官方社区指南', fr: 'Guide communautaire non officiel', de: 'Inoffizieller Community-Leitfaden' }
const LANG = { en: 'en', ko: 'ko', ja: 'ja', 'zh-cn': 'zh-CN', fr: 'fr', de: 'de' }

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function pages() {
  const out = []
  const walk = dir => {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f)
      if (fs.statSync(p).isDirectory()) walk(p)
      else if (/\.mdx?$/.test(f)) {
        const src = fs.readFileSync(p, 'utf8')
        const fm = yaml.load(src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '') ?? {}
        const rel = path.relative(ROOT, p).replace(/\.mdx?$/, '')
        const id = rel.replace(/\/index$/, '')
        const [locale, section] = id.split('/')
        out.push({ id, locale, section: SECTION[section] ? section : 'other', title: fm.title, description: fm.description ?? fm.hero?.tagline ?? '' })
      }
    }
  }
  walk(ROOT)
  return out
}

const html = p => `<!doctype html><html lang="${LANG[p.locale]}"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: #141418; color: #f4f4f6; overflow: hidden;
    font-family: -apple-system, 'Apple SD Gothic Neo', 'Hiragino Sans', 'PingFang SC', 'Helvetica Neue', sans-serif; }
  :lang(ko) .t, :lang(ko) .d { word-break: keep-all; }
  :lang(ja) .t, :lang(zh-CN) .t { word-break: auto-phrase; }
  .wrap { position: absolute; inset: 56px 64px; display: flex; flex-direction: column; }
  .top { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 700; }
  .dots i { display: inline-block; width: 14px; height: 14px; border-radius: 50%; margin-right: 8px; }
  .site { color: #d97757; }
  .kicker { color: #a1a1aa; font-weight: 600; }
  .t { margin-top: 48px; font-size: ${p.title.length > 34 ? 60 : 72}px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; max-width: 830px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .d { margin-top: 26px; font-size: 29px; line-height: 1.45; color: #c4c4cc; max-width: 820px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-size: 22px; color: #8b8b95; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: linear-gradient(90deg, #d97757, #f6c9b4 55%, #a78bfa); }
  .term { position: absolute; right: -40px; top: 150px; width: 330px; height: 300px; border: 3px solid #2e2e36; border-radius: 22px; opacity: .55; }
  .term::before { content: ''; position: absolute; left: 22px; right: 22px; bottom: 26px; height: 34px; border: 3px solid #3a3a44; border-radius: 8px; }
  .term::after { content: ''; position: absolute; left: 22px; right: 22px; bottom: 74px; height: 24px; border-radius: 6px; background: #d97757; opacity: .55; }
</style></head><body>
  <div class="term"></div>
  <div class="wrap">
    <div class="top"><span class="dots"><i style="background:#f87171"></i><i style="background:#fbbf24"></i><i style="background:#34d399"></i></span>
      <span class="site">mods.guide</span><span class="kicker">· ${esc(SECTION[p.section][p.locale])}</span></div>
    <div class="t">${esc(p.title)}</div>
    <div class="d">${esc(p.description)}</div>
    <div class="foot"><span>${esc(UNOFFICIAL[p.locale])} · Claude Code mods</span><span>${p.locale.toUpperCase()}</span></div>
  </div>
  <div class="bar"></div>
</body></html>`

const list = pages()
const browser = await chromium.launch({ executablePath: process.env.CHROME })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
// 제목·설명이 바뀐 쪽만 다시 그린다 (scripts/cache/og-stamps.json)
const STAMPS = path.join('scripts', 'cache', 'og-stamps.json')
const stamps = fs.existsSync(STAMPS) ? JSON.parse(fs.readFileSync(STAMPS, 'utf8')) : {}
let made = 0
for (const p of list) {
  const file = path.join(OUT, `${p.id}.jpg`)
  const stamp = JSON.stringify([p.title, p.description, p.section])
  if (!force && fs.existsSync(file) && stamps[p.id] === stamp) continue
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await page.setContent(html(p), { waitUntil: 'load' })
  await page.screenshot({ path: file, type: 'jpeg', quality: 82 })
  stamps[p.id] = stamp
  made++
}
await browser.close()
fs.writeFileSync(STAMPS, JSON.stringify(stamps, null, 1))
console.log(`og images: ${made} made, ${list.length} pages`)
