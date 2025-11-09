import { list, del } from '@vercel/blob';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response('Missing userId', { status: 400 });
    }

    const { blobs } = await list({
      prefix: userId + '/',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // 删除所有该用户的文件
    if (blobs.length > 0) {
      await Promise.all(blobs.map(blob => 
        del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
      ));
    }

    return new Response(JSON.stringify({ 
      deleted: blobs.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete error:', error);
    return new Response('Delete failed', { status: 500 });
  }
}

export const config = {
  runtime: 'edge'
};
