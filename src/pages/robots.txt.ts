// 검색 엔진에 전부 열고 사이트맵 위치를 알려 준다
import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
