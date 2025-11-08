// api/clear.js
import { list, del } from '@vercel/blob';

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = (searchParams.get('room') || '').trim();
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    let cursor, total = 0;
    do {
      const res = await list({ prefix: `${room}/`, cursor, limit: 1000, token });
      if (res.blobs.length) {
        await del(res.blobs.map(b => b.url), { token });
        total += res.blobs.length;
      }
      cursor = res.cursor;
    } while (cursor);

    return new Response(JSON.stringify({ ok: true, deleted: total }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
