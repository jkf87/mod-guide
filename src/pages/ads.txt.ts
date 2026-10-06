// AdSense 판매자 확인용 ads.txt. 게시자 ID가 있을 때만 내용을 쓴다
export function GET() {
  const client = import.meta.env.PUBLIC_ADSENSE_CLIENT ?? ''
  const pub = client.replace(/^ca-/, '')
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# AdSense publisher ID not configured yet\n'
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
