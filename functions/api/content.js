// 공개: 저장된 사이트 콘텐츠(JSON) 반환. 없으면 {} → 프론트가 HTML 기본값 사용.
export async function onRequestGet({ env }) {
  let data = "{}";
  try { data = (await env.MOVEK_CONTENT.get("site")) || "{}"; } catch (e) {}
  return new Response(data, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
