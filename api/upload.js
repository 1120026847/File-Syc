import { put, list, del } from '@vercel/blob';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const { searchParams } = new URL(request.url);
    const room = (searchParams.get('room') || '').trim();
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    // 注意：服务端直传有 4.5MB 限制，先用小图测试；要传大文件请改用客户端直传
    const form = await request.formData();
    const incomingFiles = form.getAll('file'); // 支持多文件

    // 先清空旧文件，保证“只保留最新一批”
    let cursor;
    do {
      const res = await list({ prefix: `${room}/`, limit: 1000, cursor, token });
      if (res.blobs.length) await del(res.blobs.map(b => b.url), { token });
      cursor = res.cursor;
    } while (cursor);

    // 上传新文件
    const uploaded = [];
    for (const f of incomingFiles) {
      const pathname = `${room}/${f.name}`;
      const blob = await put(pathname, f, {
        access: 'public',
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: f.type || undefined,
      });
      uploaded.push(blob);
    }

    return new Response(JSON.stringify({ ok: true, uploaded }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
}
