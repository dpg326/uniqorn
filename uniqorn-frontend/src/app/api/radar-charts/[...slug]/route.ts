import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const filename = params.slug.join('/');
  console.log('API route called for:', filename);
  
  const filePath = join(process.cwd(), 'public', 'radar-charts', filename);
  console.log('File path:', filePath);

  try {
    const fileBuffer = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const contentType = ext === 'png' ? 'image/png' : 'application/octet-stream';
    
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new Response('Image not found: ' + filename, { status: 404 });
  }
}
