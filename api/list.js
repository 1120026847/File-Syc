// api/list.js
import { list } from '@vercel/blob';


export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const room = (searchParams.get('room') || '').trim().toLowerCase();
  if (!room) return new Response(JSON.stringify({ files: [] }), { status: 200, headers: { 'content-type': 'application/json' } });

  let cursor, files = [];
  do {
    const res = await list({ prefix: `${room}/`, cursor, limit: 1000 });
    files = files.concat(res.blobs);
    cursor = res.cursor;
  } while (cursor);

  return new Response(JSON.stringify({ files }), { status: 200, headers: { 'content-type': 'application/json' } });
}

