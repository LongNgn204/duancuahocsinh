// src/utils/preconnect.js
// Chú thích: Thêm preconnect đến API endpoint để giảm độ trễ kết nối
export function preconnectToApi() {
  const endpoint =
    import.meta.env.VITE_API_URL ?? import.meta.env.VITE_AI_PROXY_URL ?? null;
  if (!endpoint) return;
  try {
    const u = new URL(endpoint);
    const href = `${u.protocol}//${u.host}`;
    const id = `preconnect-${u.host}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  } catch (_) {
    // ignore
  }
}

