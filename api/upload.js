import { put } from '@vercel/blob';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return new Response('Missing file or userId', { status: 400 });
    }

    const filename = `${userId}/${file.name}`;
    
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return new Response(JSON.stringify({
      url: blob.url,
      filename: file.name,
      size: file.size
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Upload failed', { status: 500 });
  }
}

export const config = {
  runtime: 'edge'
};
