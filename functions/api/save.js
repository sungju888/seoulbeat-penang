// 콘텐츠 저장: x-auth 토큰 검증 후 KV에 site 저장
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequestPost({ request, env }) {
  const token = request.headers.get("x-auth") || "";
  const raw = await env.MOVEK_CONTENT.get("auth");
  if (!raw) return json({ ok: false }, 500);
  const a = JSON.parse(raw);
  if (!token || token !== a.token) return json({ ok: false }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false }, 400); }
  const content = body && body.content;
  if (!content || typeof content !== "object") return json({ ok: false, error: "bad_content" }, 400);

  // 안전장치: 과도한 크기 차단
  const str = JSON.stringify(content);
  if (str.length > 200000) return json({ ok: false, error: "too_large" }, 413);

  await env.MOVEK_CONTENT.put("site", str);
  return json({ ok: true });
}
