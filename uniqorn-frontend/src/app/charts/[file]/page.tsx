import Link from 'next/link';
import ChartImage from '@/components/ChartImage';

type Params = { file: string };

export default function Page({ params }: { params: Params }) {
  const file = decodeURIComponent(params.file);
  
  // Parse the filename to extract player name and date
  const baseName = file.replace('.png', '');
  const lastUnderscoreIndex = baseName.lastIndexOf('_');
  const date = lastUnderscoreIndex > 0 ? baseName.substring(lastUnderscoreIndex + 1) : '';
  const playerName = lastUnderscoreIndex > 0 ? baseName.substring(0, lastUnderscoreIndex).replace(/_/g, ' ') : baseName.replace(/_/g, ' ');
  
  const formattedDate = date && date.match(/^\d{4}-\d{2}-\d{2}$/) 
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : '';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400/20 to-sky-300/20 px-6 py-4">
          <h1 className="text-xl font-semibold text-sky-200">Uniqorn Radar Chart</h1>
          <p className="text-sm text-zinc-300 mt-1">
            Statistical performance visualization for {playerName} on {formattedDate}
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-hidden rounded-xl border border-sky-400/20 bg-zinc-950/40 p-4">
            <ChartImage file={file} />
          </div>
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 rounded-lg bg-sky-400/20 text-sky-200 hover:bg-sky-400/30 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
