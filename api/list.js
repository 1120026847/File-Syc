// api/list.js
import { list } from '@vercel/blob';

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = (searchParams.get('room') || '').trim();
    if (!room) {
      return new Response(JSON.stringify({ files: [] }), {
        headers: { 'content-type': 'application/json' }
      });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN; // 显式传入
    let cursor = undefined;
    const files = [];
    do {
      const res = await list({ prefix: `${room}/`, cursor, limit: 1000, token });
      files.push(...res.blobs);
      cursor = res.cursor;
    } while (cursor);

    return new Response(JSON.stringify({ files }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err?.message || err) }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
