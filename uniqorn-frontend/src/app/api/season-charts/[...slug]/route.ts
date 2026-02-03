import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const filename = params.slug.join('/');

  const primaryPath = join(process.cwd(), 'public', 'season-charts-master', filename);
  const fallbackPath = join(process.cwd(), 'public', 'season-charts', filename);

  try {
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(primaryPath);
    } catch {
      fileBuffer = await readFile(fallbackPath);
    }
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const contentType = ext === 'png' ? 'image/png' : 'application/octet-stream';
    
    const body = new Uint8Array(fileBuffer);

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.log('Looking for file:', primaryPath);
    console.log('Looking for fallback file:', fallbackPath);
    console.log('Filename requested:', filename);
    return new Response('Season chart not found: ' + filename, { status: 404 });
  }
}
