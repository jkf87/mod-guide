#!/usr/bin/env node
// mod마다 README에서 첫 번째 "진짜" 그림(스크린샷·GIF)을 찾아 scripts/cache/images.json에 적는다.
// 배지(shields.io 등)와 아이콘 크기 그림은 거르고, 실제로 열리는 그림만 남긴다.
// GitHub API를 쓰므로 gh 로그인 토큰(또는 GITHUB_TOKEN)이 있어야 빠르다. 결과는 커밋해 두고 빌드는 이 캐시만 읽는다.
//   node scripts/fetch-mod-images.mjs <카탈로그 mods.json 경로> [--refresh]
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const SOURCE = 'https://raw.githubusercontent.com/karanb192/awesome-claude-code-mods/main/data/mods.json'
const args = process.argv.slice(2)
const refresh = args.includes('--refresh')
const local = args.find(a => !a.startsWith('--'))
const raw = local ? JSON.parse(fs.readFileSync(local, 'utf8')) : await (await fetch(SOURCE)).json()
const CACHE = path.join('scripts', 'cache', 'images.json')
const cache = !refresh && fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {}

let token = process.env.GITHUB_TOKEN
if (!token) try { token = execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch {}
const gh = (url, accept = 'application/vnd.github.raw') =>
  fetch(url, { headers: { accept, 'user-agent': 'mod-guide', ...(token ? { authorization: `Bearer ${token}` } : {}) } })

const BADGE = /shields\.io|badge|badgen|travis-ci|codecov|coveralls|circleci|github\.com\/[^/]+\/[^/]+\/(actions\/)?workflows|npmjs|nodei\.co|img\.buymeacoffee|ko-fi|paypal|sponsor|star-history|api\.star|contrib\.rocks|visitor|hits\.|komarev|vercel\.com\/button|deploy-button|license|socialify/i
const IMG_EXT = /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i

// README 본문에서 그림 주소를 나온 순서대로 뽑는다 (마크다운 ![](), HTML <img src>, 참조식 링크)
function imageUrls(md) {
  const out = []
  const refs = Object.fromEntries([...md.matchAll(/^\s*\[([^\]]+)\]:\s*(\S+)/gm)].map(m => [m[1].toLowerCase(), m[2]]))
  const re = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)|!\[[^\]]*\]\[([^\]]+)\]|<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi
  for (const m of md.matchAll(re)) {
    const tag = m[0]
    const url = m[1] ?? (m[2] ? refs[m[2].toLowerCase()] : null) ?? m[3]
    if (!url) continue
    // 아이콘 크기로 지정된 img는 뺀다
    const w = tag.match(/\bwidth\s*=\s*["']?(\d+)/i)
    if (w && Number(w[1]) < 120) continue
    out.push(url)
  }
  return out
}

function resolve(url, repo, ref, dir) {
  if (/^data:/i.test(url)) return null
  if (/^https?:\/\//i.test(url)) {
    // github.com/<o>/<r>/blob/<ref>/<path> → raw
    const blob = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)\/(?:blob|raw)\/(.+)$/)
    if (blob) return `https://raw.githubusercontent.com/${blob[1]}/${blob[2].replace(/\?raw=true$/, '')}`
    return url
  }
  if (url.startsWith('//')) return `https:${url}`
  const clean = url.replace(/^\.\//, '')
  const full = clean.startsWith('/') ? clean.slice(1) : path.posix.normalize(path.posix.join(dir, clean))
  if (full.startsWith('..')) return null
  return `https://raw.githubusercontent.com/${repo}/${ref}/${full}`
}

async function reachable(url) {
  try {
    const res = await fetch(url, { method: 'GET', headers: { range: 'bytes=0-1023', 'user-agent': 'mod-guide' }, redirect: 'follow' })
    const type = res.headers.get('content-type') ?? ''
    res.body?.cancel()
    return (res.ok || res.status === 206) && (type.startsWith('image/') || (type === 'application/octet-stream' && IMG_EXT.test(url)))
  } catch {
    return false
  }
}

async function readme(repo, dir, ref) {
  for (const d of dir ? [dir, ''] : ['']) {
    const res = await gh(`https://api.github.com/repos/${repo}/readme/${d}${ref ? `?ref=${ref}` : ''}`, 'application/vnd.github+json')
    if (res.status === 403 || res.status === 429) throw new Error(`GitHub rate limit (${res.status}) — gh auth login 후 다시 실행`)
    if (!res.ok) continue
    const j = await res.json()
    return { md: Buffer.from(j.content, 'base64').toString('utf8'), dir: path.posix.dirname(j.path) === '.' ? '' : path.posix.dirname(j.path) }
  }
  return null
}

async function findImage(m) {
  const ref = m.sourceCommit || m.defaultBranch || 'HEAD'
  const r = await readme(m.repo, m.path || '', m.sourceCommit)
  if (!r) return null
  for (const u of imageUrls(r.md)) {
    if (BADGE.test(u)) continue
    const abs = resolve(u, m.repo, ref, r.dir)
    if (!abs) continue
    // 확장자가 없는 주소는 GitHub 첨부(user-attachments)나 camo만 받는다
    if (!IMG_EXT.test(abs) && !/user-attachments\/assets|githubusercontent\.com\/.+\/assets\//.test(abs)) continue
    if (/\.svg(\?|#|$)/i.test(abs)) continue
    if (await reachable(abs)) return abs
  }
  return null
}

const mods = raw.mods.filter(m => (m.kind === 'mod' || m.kind === 'builtin') && !m.archived && !m.duplicateOf && m.validate?.status === 'passed')
const todo = mods.filter(m => !(`${m.repo}:${m.path ?? ''}` in cache))
console.log(`${mods.length} mods, ${todo.length} to fetch`)
let done = 0
const queue = [...todo]
await Promise.all(Array.from({ length: 12 }, async () => {
  for (let m; (m = queue.shift()); ) {
    const key = `${m.repo}:${m.path ?? ''}`
    try {
      cache[key] = await findImage(m)
    } catch (e) {
      if (String(e.message).includes('rate limit')) throw e
      cache[key] = null
    }
    if (++done % 100 === 0) {
      console.log(`${done}/${todo.length}`)
      fs.mkdirSync(path.dirname(CACHE), { recursive: true })
      fs.writeFileSync(CACHE, JSON.stringify(cache, null, 0))
    }
  }
}))
fs.mkdirSync(path.dirname(CACHE), { recursive: true })
fs.writeFileSync(CACHE, JSON.stringify(Object.fromEntries(Object.entries(cache).sort()), null, 1))
const found = mods.filter(m => cache[`${m.repo}:${m.path ?? ''}`]).length
console.log(`images: ${found}/${mods.length}`)
