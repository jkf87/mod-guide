// mod 카드 한 장의 HTML. 디렉터리(브라우저에서 그림)와 홈 쇼케이스(빌드 때 그림)가 같은 함수를 쓴다.
// m: public/data/mods.json의 항목, t: { builtin, view, cats, levels, where } (언어별 문구)

const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

// 분류별 색 (썸네일 도식·태그 배경)
export const CAT_COLOR = {
  usage: '#a78bfa',
  safety: '#f87171',
  agents: '#34d399',
  memory: '#60a5fa',
  git: '#fbbf24',
  interface: '#f472b6',
  fun: '#fb923c',
  other: '#94a3b8',
}

// GitHub에 올라간 그림은 Netlify 이미지 CDN으로 줄여 받는다 (배포본에서만; 개발 서버는 원본)
const CDN_HOSTS = /^https:\/\/(raw\.githubusercontent\.com|github\.com|user-images\.githubusercontent\.com|private-user-images\.githubusercontent\.com)\//
export function imgSrc(url, width, cdn) {
  if (!cdn || !CDN_HOSTS.test(url)) return url
  return `/.netlify/images?url=${encodeURIComponent(url)}&w=${width}&fm=webp&q=70`
}

// 그림이 없는 mod: 터미널 창 안에 mod 이름을 크게 쓰고, mod가 화면 어디에 나타나는지 분류 색으로 칠한다
export function schematic(dw, color, name = '') {
  const on = c => dw.includes(c)
  const pane = on('P')
  const hi = `fill="${color}"`
  const dim = 'fill="currentColor" fill-opacity="0.13"'
  const width = pane ? 92 : 144
  const max = Math.floor(width / 7.2)
  const label = name.length > max ? `${name.slice(0, max - 1)}…` : name
  const size = label.length > 12 ? 10.5 : 12.5
  const lines = [42, 50]
    .map((y, i) => `<rect x="12" y="${y}" width="${[width - 30, width - 52][i]}" height="3.5" rx="1.75" ${on('M') && i === 0 ? hi : dim}/>`)
    .join('')
  return `<svg viewBox="0 0 160 90" role="img" aria-hidden="true" class="mod-thumb__svg">
    <rect x="0.5" y="0.5" width="159" height="89" rx="6" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.25"/>
    <circle cx="9" cy="8" r="2" fill="#f87171"/><circle cx="16" cy="8" r="2" fill="#fbbf24"/><circle cx="23" cy="8" r="2" fill="#34d399"/>
    <text x="12" y="${size > 11 ? 31 : 30}" font-size="${size}" font-weight="700" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" fill="currentColor" fill-opacity="0.92">${escXml(label)}</text>
    ${lines}
    ${pane ? `<rect x="108" y="15" width="44" height="58" rx="3" ${hi} fill-opacity="0.85"/><rect x="113" y="21" width="26" height="3" rx="1.5" fill="#fff" fill-opacity="0.85"/><rect x="113" y="28" width="32" height="3" rx="1.5" fill="#fff" fill-opacity="0.6"/><rect x="113" y="35" width="20" height="3" rx="1.5" fill="#fff" fill-opacity="0.6"/>` : ''}
    ${on('S') ? `<rect x="12" y="55" width="36" height="3.5" rx="1.75" ${hi}/>` : ''}
    ${on('A') ? `<rect x="8" y="59" width="${width}" height="7" rx="2" ${hi} fill-opacity="0.85"/>` : ''}
    <rect x="8" y="68" width="${width}" height="10" rx="2" fill="none" stroke="currentColor" stroke-opacity="0.35"/>
    <text x="12" y="75.5" font-size="6" font-family="ui-monospace,monospace" fill="currentColor" fill-opacity="0.5">&gt;</text>
    ${on('T') ? `<rect x="8" y="81" width="60" height="3" rx="1.5" ${hi}/>` : ''}
    ${!pane && !on('A') && !on('S') && !on('M') && !on('T') ? `<rect x="12" y="35" width="${Math.min(width - 24, label.length * (size * 0.6))}" height="2" rx="1" ${hi}/>` : ''}
  </svg>`
}
const escXml = s => String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch])

export function cardHtml(m, t, cdn) {
  const owner = m.r.split('/')[0]
  const color = CAT_COLOR[m.c] ?? CAT_COLOR.other
  const logo = m.img && /logo|icon|avatar|banner/i.test(m.img.split('/').pop())
  // 도식을 늘 깔고 그림을 위에 얹는다: 그림이 늦거나 깨지면 도식이 보인다
  const thumb =
    schematic(m.dw ?? '', color, m.n) +
    (m.img
      ? `<img src="${esc(imgSrc(m.img, 640, cdn))}" alt="" loading="lazy" decoding="async" class="mod-thumb__img${logo ? ' is-logo' : ''}" onload="var r=this.naturalWidth/this.naturalHeight;this.classList.add('is-loaded');if(r>2.1||r<1.1)this.classList.add('is-fit')" onerror="this.remove()"/>`
      : '')
  const where = (m.dw ?? '')
    .split('')
    .map(c => t.where?.[c])
    .filter(Boolean)
    .join(' · ')
  return `<li class="mod-card" style="--cat:${color}">
    <a class="mod-thumb" href="${esc(m.u)}" rel="noopener" target="_blank" tabindex="-1" aria-hidden="true">${thumb}${where ? `<span class="mod-thumb__where">${esc(where)}</span>` : ''}</a>
    <div class="mod-card__body">
      <div class="mod-card__owner">
        <img src="https://avatars.githubusercontent.com/${esc(owner)}?s=48" alt="" loading="lazy" width="20" height="20" class="mod-card__avatar"/>
        <a href="https://github.com/${esc(m.r)}" rel="noopener" target="_blank">${esc(m.r)}</a>
        ${m.b ? `<span class="mod-badge mod-badge--builtin">${esc(t.builtin)}</span>` : ''}
      </div>
      <a class="mod-card__name" href="${esc(m.u)}" rel="noopener" target="_blank">${esc(m.n)}</a>
      <p class="mod-card__desc">${esc(m.d)}</p>
      <div class="mod-card__tags">
        <span class="mod-badge mod-badge--cat">${esc(t.cats[m.c] ?? m.c)}</span>
        <span class="mod-badge mod-badge--lv${m.lv}" title="${esc((m.rl ?? []).filter(x => !x.startsWith('other:')).join(', '))}">${esc(t.levels[m.lv] ?? '')}</span>
        ${m.w && t.warn ? `<span class="mod-badge mod-badge--warn" title="${esc(t.warn[1])}">${esc(t.warn[0])}</span>` : ''}
      </div>
    </div>
    <div class="mod-card__foot">
      <span title="GitHub stars (repository)">★ ${Number(m.s).toLocaleString('en-US')}</span>
      ${m.l && m.l !== 'NOASSERTION' ? `<span>${esc(m.l)}</span>` : ''}
      ${m.p ? `<span>${esc(m.p)}</span>` : ''}
      <a class="mod-card__view" href="${esc(m.u)}" rel="noopener" target="_blank">${esc(t.view)} ↗</a>
    </div>
  </li>`
}
