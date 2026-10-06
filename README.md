# Claude Code Mod Guide

Claude Code mod(function hooks 플러그인)를 다루는 비공식 커뮤니티 가이드 사이트예요. 6개 언어(en·ko·ja·zh-cn·fr·de)로 서비스하고, Google AdSense 광고 자리가 들어 있어요. [Astro Starlight](https://starlight.astro.build)로 만들었어요.

> Anthropic과 관계없는 비공식 사이트예요. Claude와 Claude Code는 Anthropic의 상표예요.

## 구조

| 경로 | 내용 |
|---|---|
| `src/content/docs/ko/` | 한국어 원본 (이걸 먼저 고치고 나머지 언어에 반영) |
| `src/content/docs/{en,ja,zh-cn,fr,de}/` | 번역본. 영어가 기본 언어라 없는 쪽은 영어로 대체돼요 |
| `src/components/ModDirectory.astro` | mod 디렉터리(검색·분류·정렬·접근 수준 필터), 6개 언어 UI |
| `src/components/AdSlot.astro` | 광고 자리 (사이드바, 본문 끝) |
| `src/components/{Head,PageSidebar,MarkdownContent,Footer}.astro` | Starlight 기본 컴포넌트 확장 (광고 스크립트, 광고 자리, 비공식 고지) |
| `src/pages/index.astro` | `/` → 브라우저 언어에 맞는 `/{lang}/`로 이동 |
| `src/pages/ads.txt.ts` | AdSense `ads.txt` |
| `scripts/build-mods-data.mjs` | 커뮤니티 카탈로그를 받아 `public/data/mods.json`, `src/data/stats.json` 생성 |

## 개발

```bash
npm install
npm run data      # mod 데이터 새로 받기 (karanb192/awesome-claude-code-mods, CC0)
npm run dev       # http://localhost:4321
npm run build     # dist/
```

## 환경 변수

| 변수 | 예 | 쓰임 |
|---|---|---|
| `SITE_URL` | `https://mods.example.com` | canonical·sitemap·hreflang |
| `PUBLIC_ADSENSE_CLIENT` | `ca-pub-1234567890123456` | 광고 스크립트와 `ads.txt`. 없으면 광고가 꺼져요 |
| `PUBLIC_ADSENSE_SLOT_SIDEBAR` | `1234567890` | 오른쪽 사이드바 광고 단위 |
| `PUBLIC_ADSENSE_SLOT_ARTICLE` | `1234567890` | 본문 끝 광고 단위 |

개발 서버에서는 광고 자리가 점선 상자로 보여요. 개인정보 처리방침·소개 페이지에는 본문 광고를 넣지 않아요.

AdSense로 EEA·영국·스위스 방문자에게 광고하려면 AdSense의 **개인정보 보호 및 메시지**에서 Google 인증 CMP(동의 메시지)를 켜야 해요.

## 배포

정적 사이트라 Netlify, Cloudflare Pages, GitHub Pages 어디든 올라가요. 빌드 명령 `npm run build`, 출력 폴더 `dist`, 위 환경 변수를 호스팅 설정에 넣어요.

## 라이선스

코드 MIT. mod 디렉터리 데이터는 [awesome-claude-code-mods](https://github.com/karanb192/awesome-claude-code-mods)의 CC0 데이터예요.
