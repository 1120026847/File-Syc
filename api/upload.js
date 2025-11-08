// api/upload.js
import { put, list, del } from '@vercel/blob';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    const { searchParams } = new URL(request.url);
    const room = (searchParams.get('room') || '').trim();
    const form = await request.formData();
    const incomingFiles = form.getAll('file'); // 支持多文件
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    // 1) 先删旧文件（避免 Store 越堆越多）
    let cursor;
    do {
      const res = await list({ prefix: `${room}/`, cursor, limit: 1000, token });
      if (res.blobs.length) {
        await del(res.blobs.map(b => b.url), { token });
      }
      cursor = res.cursor;
    } while (cursor);

    // 2) 上传新文件（覆盖同名）
    const uploaded = [];
    for (const f of incomingFiles) {
      const pathname = `${room}/${f.name}`;
      const blob = await put(pathname, f, {
        access: 'public',
        token,
        addRandomSuffix: false,   // 保持原名
        allowOverwrite: true,     // 允许覆盖
        contentType: f.type || undefined,
      });
      uploaded.push(blob);
    }

    return new Response(JSON.stringify({ ok: true, uploaded }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
