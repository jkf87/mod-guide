// 빌드 때 mod 목록을 읽고, 그 언어 설명으로 바꿔 둔다 (디렉터리·홈 공용)
import fs from 'node:fs'
import path from 'node:path'
import { descFile } from './modStrings.js'

export function loadMods(lang) {
  const mods = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/mods.json'), 'utf8'))
  const file = descFile(lang)
  if (!file) return mods
  const local = path.join(process.cwd(), 'public', file)
  if (!fs.existsSync(local)) return mods
  const desc = JSON.parse(fs.readFileSync(local, 'utf8'))
  return mods.map((m, i) => (desc[i] ? { ...m, d: desc[i] } : m))
}
