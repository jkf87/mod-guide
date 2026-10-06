// 디렉터리·홈 쇼케이스가 함께 쓰는 언어별 문구
export const LANGS = ['en', 'ko', 'ja', 'zh-CN', 'fr', 'de']
export const langKey = lang => (LANGS.includes(lang) ? lang : lang === 'zh-cn' ? 'zh-CN' : 'en')

export const UI = {
  en: { sortNew: 'Newest', search: 'Search mods by name, author or description', all: 'All', sortStars: 'Most stars', sortRecent: 'Recently updated', sortName: 'Name', access: 'Access', anyAccess: 'Any access', more: 'Show more', count: '{n} mods', none: 'No mods match.', builtin: 'built-in', source: 'Data: community catalogue awesome-claude-code-mods (CC0), scanned {date} against Claude Code {v}. Validation checks source only and is not a safety guarantee — read the code before installing.' },
  ko: { sortNew: '새로 나온 순', search: '이름·작성자·설명으로 mod 찾기', all: '전체', sortStars: '별 많은 순', sortRecent: '최근 업데이트 순', sortName: '이름 순', access: '접근 범위', anyAccess: '모든 접근 범위', more: '더 보기', count: 'mod {n}개', none: '맞는 mod가 없어요.', builtin: '내장', source: '데이터: 커뮤니티 카탈로그 awesome-claude-code-mods(CC0), {date} 스캔, Claude Code {v} 기준. 검증은 소스만 확인하며 안전을 보장하지 않아요. 설치 전에 코드를 읽어 보세요.' },
  ja: { sortNew: '新着順', search: '名前・作者・説明で Mod を検索', all: 'すべて', sortStars: 'スターが多い順', sortRecent: '最近更新された順', sortName: '名前順', access: 'アクセス範囲', anyAccess: 'すべてのアクセス範囲', more: 'もっと見る', count: '{n} 件の Mod', none: '該当する Mod はありません。', builtin: '組み込み', source: 'データ: コミュニティカタログ awesome-claude-code-mods(CC0)、{date} スキャン、Claude Code {v} 基準。検証はソースのみを確認するもので安全を保証しません。インストール前にコードを読んでください。' },
  'zh-CN': { sortNew: '最新发布', search: '按名称、作者或描述搜索 Mod', all: '全部', sortStars: '星标最多', sortRecent: '最近更新', sortName: '名称', access: '访问范围', anyAccess: '任意访问范围', more: '显示更多', count: '{n} 个 Mod', none: '没有匹配的 Mod。', builtin: '内置', source: '数据：社区目录 awesome-claude-code-mods（CC0），{date} 扫描，基于 Claude Code {v}。验证只检查源代码，并不保证安全——安装前请阅读代码。' },
  fr: { sortNew: 'Plus récents', search: 'Rechercher un mod par nom, auteur ou description', all: 'Tous', sortStars: 'Plus d’étoiles', sortRecent: 'Mis à jour récemment', sortName: 'Nom', access: 'Accès', anyAccess: 'Tout accès', more: 'Afficher plus', count: '{n} mods', none: 'Aucun mod ne correspond.', builtin: 'intégré', source: 'Données : catalogue communautaire awesome-claude-code-mods (CC0), analysé le {date} avec Claude Code {v}. La validation ne vérifie que le code source et ne garantit pas la sécurité — lisez le code avant d’installer.' },
  de: { sortNew: 'Neueste', search: 'Mods nach Name, Autor oder Beschreibung suchen', all: 'Alle', sortStars: 'Meiste Sterne', sortRecent: 'Zuletzt aktualisiert', sortName: 'Name', access: 'Zugriff', anyAccess: 'Jeder Zugriff', more: 'Mehr anzeigen', count: '{n} Mods', none: 'Keine passenden Mods.', builtin: 'integriert', source: 'Daten: Community-Katalog awesome-claude-code-mods (CC0), gescannt am {date} mit Claude Code {v}. Die Validierung prüft nur den Quellcode und garantiert keine Sicherheit – lies den Code vor der Installation.' },
}
export const CATEGORIES = {
  usage: { en: 'Usage & dashboards', ko: '사용량·대시보드', ja: '使用量・ダッシュボード', 'zh-CN': '用量与仪表板', fr: 'Usage et tableaux de bord', de: 'Nutzung & Dashboards' },
  safety: { en: 'Safety & privacy', ko: '안전·프라이버시', ja: '安全・プライバシー', 'zh-CN': '安全与隐私', fr: 'Sécurité et confidentialité', de: 'Sicherheit & Datenschutz' },
  agents: { en: 'Agents & workflows', ko: '에이전트·워크플로', ja: 'エージェント・ワークフロー', 'zh-CN': '智能体与工作流', fr: 'Agents et workflows', de: 'Agenten & Workflows' },
  memory: { en: 'Memory & context', ko: '메모리·컨텍스트', ja: 'メモリ・コンテキスト', 'zh-CN': '记忆与上下文', fr: 'Mémoire et contexte', de: 'Gedächtnis & Kontext' },
  git: { en: 'Git, PRs & CI', ko: 'Git·PR·CI', ja: 'Git・PR・CI', 'zh-CN': 'Git、PR 与 CI', fr: 'Git, PR et CI', de: 'Git, PRs & CI' },
  interface: { en: 'Interface & rendering', ko: '화면·렌더링', ja: '画面・レンダリング', 'zh-CN': '界面与渲染', fr: 'Interface et rendu', de: 'Oberfläche & Darstellung' },
  fun: { en: 'While you wait', ko: '기다리는 동안', ja: '待ち時間に', 'zh-CN': '等待时', fr: 'Pendant l’attente', de: 'Während du wartest' },
  other: { en: 'Other', ko: '기타', ja: 'その他', 'zh-CN': '其他', fr: 'Autres', de: 'Sonstiges' },
}
export const LEVELS = {
  en: ['draws & remembers', 'reads', 'writes or runs', 'network'],
  ko: ['화면·기억만', '읽기', '쓰기·실행', '네트워크'],
  ja: ['描画と記憶のみ', '読み取り', '書き込み・実行', 'ネットワーク'],
  'zh-CN': ['仅绘制与记忆', '读取', '写入或运行', '网络'],
  fr: ['affiche et mémorise', 'lit', 'écrit ou exécute', 'réseau'],
  de: ['zeichnet & merkt sich', 'liest', 'schreibt oder führt aus', 'Netzwerk'],
}

export const VIEW = { en: 'Repository', ko: '저장소 보기', ja: 'リポジトリ', 'zh-CN': '查看仓库', fr: 'Dépôt', de: 'Repository' }
export const WHERE = {
  en: { P: 'side pane', A: 'band above prompt', M: 'messages', S: 'spinner & hints', T: 'status line' },
  ko: { P: '옆 창', A: '입력창 위 띠', M: '메시지', S: '스피너·힌트', T: '상태줄' },
  ja: { P: 'サイドペイン', A: '入力欄の上', M: 'メッセージ', S: 'スピナー・ヒント', T: 'ステータス行' },
  'zh-CN': { P: '侧边窗格', A: '输入框上方', M: '消息', S: '加载动画与提示', T: '状态栏' },
  fr: { P: 'volet latéral', A: 'bandeau au-dessus du prompt', M: 'messages', S: 'spinner et astuces', T: 'ligne d’état' },
  de: { P: 'Seitenbereich', A: 'Band über dem Prompt', M: 'Nachrichten', S: 'Spinner & Hinweise', T: 'Statuszeile' },
}

// 검증을 경고와 함께 통과한 mod 표시 (대개 author 같은 메타데이터 누락)
export const WARN = {
  en: ['validation warning', 'Passed claude plugin validate with warnings, usually missing metadata such as author.'],
  ko: ['검증 경고', '경고와 함께 claude plugin validate를 통과했어요. 대개 author 같은 메타데이터가 빠진 경우예요.'],
  ja: ['検証の警告', '警告付きで claude plugin validate を通過しました。多くは author などのメタデータ不足です。'],
  'zh-CN': ['验证警告', '带警告通过了 claude plugin validate，通常是缺少 author 等元数据。'],
  fr: ['avertissement', 'A passé claude plugin validate avec des avertissements, souvent des métadonnées manquantes comme author.'],
  de: ['Validierungswarnung', 'Hat claude plugin validate mit Warnungen bestanden, meist fehlen Metadaten wie author.'],
}

// 카드 문구 묶음 (modCard.js의 t)
export function cardText(lang) {
  const k = langKey(lang)
  return {
    builtin: UI[k].builtin,
    view: VIEW[k],
    cats: Object.fromEntries(Object.entries(CATEGORIES).map(([id, names]) => [id, names[k]])),
    levels: LEVELS[k],
    where: WHERE[k],
    warn: WARN[k],
  }
}
