const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
});

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = env.FRONTEND_ORIGIN;
  if (!origin || !allowed || allowed.startsWith('REPLACE-') || origin !== allowed) return {};
  return {
    'access-control-allow-origin': allowed,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-guest-name, x-invite-code, x-file-name',
    'vary': 'Origin',
  };
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
      const inviteCode = request.headers.get('x-invite-code');
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

      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inviteCode));
      const codeHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      const guest = await env.DB.prepare(
        'SELECT name FROM guests WHERE name = ? AND invite_code_sha256 = ?'
      ).bind(name, codeHash).first();
      if (!guest) return json({ error: 'Name or invite code was not recognized.' }, 403, cors);

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
