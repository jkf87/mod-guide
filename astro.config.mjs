import fs from 'node:fs'
// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// 사이트 주소: 배포할 도메인이 정해지면 SITE_URL로 넘긴다 (sitemap·canonical·hreflang에 쓰인다)
const site = process.env.SITE_URL ?? 'https://mods.guide'

// 사이드바 항목 이름은 6개 언어로 둔다
const t = (en, ko, ja, zh, fr, de) => ({ label: en, translations: { ko, ja, 'zh-CN': zh, fr, de } })

export default defineConfig({
  site,
  integrations: [
    starlight({
      title: {
        en: 'Claude Code Mods Guide',
        ko: 'Claude Code Mods 가이드',
        ja: 'Claude Code Mods ガイド',
        'zh-CN': 'Claude Code Mods 指南',
        fr: 'Guide des mods Claude Code',
        de: 'Claude Code Mods Guide',
      },
      description: 'An unofficial community guide to Claude Code mods: what they are, how to install them safely, how to build one, and a searchable directory.',
      defaultLocale: 'en',
      locales: {
        en: { label: 'English' },
        ko: { label: '한국어' },
        ja: { label: '日本語' },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
        fr: { label: 'Français' },
        de: { label: 'Deutsch' },
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/jkf87/mod-guide' }],
      customCss: ['./src/styles/custom.css', './src/styles/mod-card.css'],
      lastUpdated: true,
      components: {
        Head: './src/components/Head.astro',
        PageSidebar: './src/components/PageSidebar.astro',
        MarkdownContent: './src/components/MarkdownContent.astro',
        Footer: './src/components/Footer.astro',
      },
      sidebar: [
        {
          ...t('Guide', '가이드', 'ガイド', '指南', 'Guide', 'Leitfaden'),
          items: [
            { slug: 'guide/what-are-mods' },
            { slug: 'guide/install-and-manage' },
            { slug: 'guide/safety-checklist' },
            { slug: 'guide/build-your-first-mod' },
            { slug: 'guide/api-cheatsheet' },
            { slug: 'guide/troubleshooting' },
          ],
        },
        {
          ...t('In depth', '심층 글', '詳しく読む', '深入阅读', 'En profondeur', 'Vertiefung'),
          items: [
            'articles/state-of-mods-2026-10',
            'articles/what-mods-touch',
            'articles/validation-failures',
            'articles/usage-mods-compared',
            'articles/safety-mods-compared',
            'articles/agent-dashboards-compared',
            'articles/tutorial-prompt-band',
            'articles/tutorial-bash-guard',
            'articles/testing-and-debugging',
            'articles/publish-your-mod',
          ]
            // 번역(영어 기본본)이 있는 글만 싣는다
            .filter(slug => fs.existsSync(`./src/content/docs/en/${slug}.mdx`))
            .map(slug => ({ slug })),
        },
        {
          ...t('Mods', 'mod 둘러보기', 'Mod を探す', '浏览 Mod', 'Explorer les mods', 'Mods entdecken'),
          items: [{ slug: 'mods/directory' }, { slug: 'mods/picks' }, { slug: 'mods/ide-mod' }],
        },
        {
          ...t('More', '더 보기', 'その他', '更多', 'Plus', 'Mehr'),
          items: [{ slug: 'faq' }, { slug: 'about' }, { slug: 'privacy' }],
        },
      ],
    }),
  ],
})
