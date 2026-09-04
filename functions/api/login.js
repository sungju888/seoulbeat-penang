// 관리자 로그인: user/pass 검증 → 성공 시 token 반환
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false }, 400); }
  const { user, pass } = body || {};
  const raw = await env.MOVEK_CONTENT.get("auth");
  if (!raw) return json({ ok: false, error: "not_configured" }, 500);
  const a = JSON.parse(raw);
  const hash = await sha256(String(pass) + a.salt);
  if (user === a.user && hash === a.hash) return json({ ok: true, token: a.token });
  return json({ ok: false }, 401);
}
