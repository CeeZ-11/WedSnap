const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
});

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = env.FRONTEND_ORIGIN;
  // Allow the configured production domain and the current gallery URL.
  const allowedOrigins = new Set([allowed, 'https://wed-snap-d59i59rxq-ceez-11s-projects.vercel.app']);
  if (!origin || !allowed || allowed.startsWith('REPLACE-') || !allowedOrigins.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-guest-name, x-invite-code, x-file-name',
    'vary': 'Origin',
  };
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/api/gallery' && request.method === 'GET') {
      const { results = [] } = await env.DB.prepare(
        'SELECT id, object_key, uploader_name, content_type, created_at FROM media ORDER BY created_at DESC LIMIT 1000'
      ).all();
      const base = `${url.origin}/media/`;
      return json(results.map((row) => ({
        id: row.id,
        url: `${base}${encodeURIComponent(row.object_key)}`,
        thumbnailUrl: `${base}${encodeURIComponent(row.object_key)}`,
        uploaderName: row.uploader_name,
        type: row.content_type.startsWith('video/') ? 'video' : 'photo',
        createdAt: row.created_at,
      })), 200, cors);
    }

    if (url.pathname.startsWith('/media/') && request.method === 'GET') {
      const key = decodeURIComponent(url.pathname.slice('/media/'.length));
      if (!key || key.includes('..')) return new Response('Not found', { status: 404 });
      const object = await env.MEDIA.get(key);
      if (!object) return new Response('Not found', { status: 404 });
      const headers = new Headers(cors);
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('cache-control', 'public, max-age=31536000, immutable');
      headers.set('x-content-type-options', 'nosniff');
      return new Response(object.body, { headers });
    }

    if (url.pathname === '/api/uploads' && request.method === 'POST') {
      // Fail closed by default. Only the Cloudflare environment switch can open uploads.
      if (env.UPLOADS_ENABLED !== 'true') {
        return json({ error: 'Wedding gallery uploads are not open yet.' }, 403, cors);
      }

      const name = request.headers.get('x-guest-name')?.trim();
      const inviteCode = request.headers.get('x-invite-code')?.trim().toUpperCase();
      const contentType = request.headers.get('content-type') || '';
      const contentLength = Number(request.headers.get('content-length') || 0);
      const fileName = request.headers.get('x-file-name') || 'upload';
      const maxBytes = 90 * 1024 * 1024;
      const allowedTypes = new Set([
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
        'video/mp4', 'video/quicktime', 'video/webm',
      ]);

      if (!name || !inviteCode || !request.body) {
        return json({ error: 'Enter your guest name and personal invite code.' }, 400, cors);
      }
      if (!allowedTypes.has(contentType.toLowerCase())) {
        return json({ error: 'This file type is not supported.' }, 415, cors);
      }
      if (!contentLength || contentLength > maxBytes) {
        return json({ error: 'Each file must be smaller than 90 MB.' }, 413, cors);
      }

      const now = Date.now();
      const lockoutWindowMs = 15 * 60 * 1000;
      const maxFailedAttempts = 10;
      const sourceIp = request.headers.get('CF-Connecting-IP') || 'unknown-ip';
      const attemptKey = await sha256Hex(`${sourceIp}\u0000${name}`);
      const attempts = await env.DB.prepare(
        'SELECT window_started_at, failed_attempts FROM upload_auth_attempts WHERE attempt_key = ?'
      ).bind(attemptKey).first();
      if (attempts && now - attempts.window_started_at < lockoutWindowMs && attempts.failed_attempts >= maxFailedAttempts) {
        return json({ error: 'Too many incorrect attempts. Please wait 15 minutes and try again.' }, 429, cors);
      }

      const recordFailedAttempt = async () => env.DB.prepare(
        `INSERT INTO upload_auth_attempts (attempt_key, window_started_at, failed_attempts)
         VALUES (?, ?, 1)
         ON CONFLICT(attempt_key) DO UPDATE SET
           window_started_at = CASE
             WHEN upload_auth_attempts.window_started_at <= ? THEN excluded.window_started_at
             ELSE upload_auth_attempts.window_started_at
           END,
           failed_attempts = CASE
             WHEN upload_auth_attempts.window_started_at <= ? THEN 1
             ELSE upload_auth_attempts.failed_attempts + 1
           END`
      ).bind(attemptKey, now, now - lockoutWindowMs, now - lockoutWindowMs).run();

      if (!/^[A-Z0-9]{4}$/.test(inviteCode)) {
        await recordFailedAttempt();
        return json({ error: 'Name or invite code was not recognized.' }, 403, cors);
      }

      const codeHash = await sha256Hex(inviteCode);
      const guest = await env.DB.prepare(
        'SELECT name FROM guests WHERE name = ? AND invite_code_sha256 = ?'
      ).bind(name, codeHash).first();
      if (!guest) {
        await recordFailedAttempt();
        return json({ error: 'Name or invite code was not recognized.' }, 403, cors);
      }
      await env.DB.prepare('DELETE FROM upload_auth_attempts WHERE attempt_key = ?').bind(attemptKey).run();

      const id = crypto.randomUUID();
      const safeName = fileName.normalize('NFKC').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
      const key = `wedding/${Date.now()}-${id}-${safeName}`;
      try {
        await env.MEDIA.put(key, request.body, {
          httpMetadata: { contentType },
          customMetadata: { uploadedBy: guest.name },
        });
        await env.DB.prepare(
          'INSERT INTO media (id, object_key, uploader_name, content_type, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(id, key, guest.name, contentType, Date.now()).run();
      } catch (error) {
        await env.MEDIA.delete(key).catch(() => {});
        console.error('Gallery upload failed:', error);
        return json({ error: 'Unable to save this file. Please try again.' }, 500, cors);
      }
      return json({ status: 'success' }, 201, cors);
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};
