import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET(
  _req: Request,
  { params }: { params: { file: string } }
): Promise<Response> {
  const requested = decodeURIComponent(params.file);
  const file = path.basename(requested);
  if (!file || file !== requested) {
    return new Response('Invalid file', { status: 400 });
  }

  const chartsDir = path.join(process.cwd(), '..', 'uniqorn_charts');
  const abs = path.join(chartsDir, file);

  try {
    const bytes = await readFile(abs);
    return new Response(bytes, {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=3600'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
