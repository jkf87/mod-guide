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
// 2차 제한(403/429)에 걸리면 retry-after만큼(없으면 60초) 기다렸다 다시 보낸다
async function gh(url, accept = 'application/vnd.github.raw') {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { accept, 'user-agent': 'mod-guide', ...(token ? { authorization: `Bearer ${token}` } : {}) } })
    if ((res.status !== 403 && res.status !== 429) || attempt >= 5) return res
    const wait = Number(res.headers.get('retry-after')) || 60
    console.log(`rate limited, waiting ${wait}s`)
    await new Promise(r => setTimeout(r, wait * 1000))
  }
}

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
    const alt = (tag.match(/!\[([^\]]*)\]/) ?? tag.match(/\balt\s*=\s*["']([^"']*)["']/i) ?? [])[1] ?? ''
    out.push({ url, alt })
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
  // 여러 mod가 든 저장소에서 mod 폴더 밖 README(루트)를 읽었으면, 이 mod 이름이 붙은 그림만 쓴다
  const isShared = (perRepo.get(m.repo) ?? 0) > 1 && r.dir !== (m.path ?? '')
  const name = String(m.name).toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const { url: u, alt } of imageUrls(r.md)) {
    if (isShared && !`${u} ${alt}`.toLowerCase().replace(/[^a-z0-9]/g, '').includes(name)) continue
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

const mods = raw.mods.filter(m => (m.kind === 'mod' || m.kind === 'builtin') && !m.archived && !m.duplicateOf && ['passed', 'warnings'].includes(m.validate?.status))
const perRepo = new Map()
for (const m of mods) perRepo.set(m.repo, (perRepo.get(m.repo) ?? 0) + 1)
const todo = mods.filter(m => !(`${m.repo}:${m.path ?? ''}` in cache))
console.log(`${mods.length} mods, ${todo.length} to fetch`)
let done = 0
const queue = [...todo]
await Promise.all(Array.from({ length: 4 }, async () => {
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
// 2단계: README에 그림이 없으면 저장소 파일 목록에서 찾는다.
// mod 폴더 안의 그림, 또는 파일 이름에 mod 이름이 들어간 그림 (예: images/blast-radius.png)
const SHOT = /\.(png|jpe?g|gif|webp)$/i
const PREFER = /screen|shot|demo|preview|hero|cover|gallery/i
const AVOID = /icon|logo|favicon|avatar|badge|sprite|emoji|fixture|test/i
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const trees = new Map()
async function tree(repo, ref) {
  const key = `${repo}@${ref}`
  if (!trees.has(key)) {
    trees.set(key, (async () => {
      const res = await gh(`https://api.github.com/repos/${repo}/git/trees/${ref}?recursive=1`, 'application/vnd.github+json')
      if (res.status === 403 || res.status === 429) throw new Error(`GitHub rate limit (${res.status})`)
      if (!res.ok) return []
      return ((await res.json()).tree ?? []).filter(t => t.type === 'blob' && SHOT.test(t.path) && t.size > 4000 && t.size < 15e6)
    })())
  }
  return trees.get(key)
}
function pick(files, m) {
  const dir = m.path ? `${m.path}/` : ''
  const name = norm(m.name)
  const score = f => {
    const base = norm(path.posix.basename(f.path).replace(SHOT, ''))
    let s = 0
    if (dir && f.path.startsWith(dir)) s += 4
    if (name.length >= 3 && base.includes(name)) s += 5
    if (PREFER.test(f.path)) s += 1
    if (AVOID.test(f.path)) s -= 6
    return s
  }
  const best = files.map(f => [score(f), f]).filter(([s]) => s >= 4).sort((a, b) => b[0] - a[0] || b[1].size - a[1].size)[0]
  return best?.[1]
}
const missing = mods.filter(m => !cache[`${m.repo}:${m.path ?? ''}`] && !(`tree:${m.repo}:${m.path ?? ''}` in cache))
console.log(`tree pass: ${missing.length} mods without an image`)
const q2 = [...missing]
let found2 = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let m; (m = q2.shift()); ) {
    const ref = m.sourceCommit || m.defaultBranch || 'HEAD'
    const f = pick(await tree(m.repo, ref).catch(e => { if (String(e.message).includes('rate limit')) throw e; return [] }), m)
    const key = `${m.repo}:${m.path ?? ''}`
    cache[`tree:${key}`] = 1
    if (f) {
      cache[key] = `https://raw.githubusercontent.com/${m.repo}/${ref}/${f.path.split('/').map(encodeURIComponent).join('/')}`
      found2++
    }
  }
}))
console.log(`tree pass found ${found2}`)

fs.mkdirSync(path.dirname(CACHE), { recursive: true })
fs.writeFileSync(CACHE, JSON.stringify(Object.fromEntries(Object.entries(cache).sort()), null, 1))
const found = mods.filter(m => typeof cache[`${m.repo}:${m.path ?? ''}`] === 'string').length
console.log(`images: ${found}/${mods.length}`)
