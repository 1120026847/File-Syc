import { list } from '@vercel/blob';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response('Missing userId', { status: 400 });
    }

    const { blobs } = await list({
      prefix: userId + '/',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const files = blobs.map(blob => ({
      url: blob.url,
      filename: blob.pathname.split('/').pop(),
      size: blob.size,
      uploaded: blob.uploadedAt
    }));

    return new Response(JSON.stringify(files), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    return new Response('Failed to list files', { status: 500 });
  }
}

export const config = {
  runtime: 'edge'
};
