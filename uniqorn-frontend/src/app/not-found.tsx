import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-y-2 rounded-xl border border-sky-500/20 bg-zinc-950/40 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="text-sm text-zinc-300">That page doesn&apos;t exist.</p>
      <Link className="text-sm text-sky-200 underline decoration-sky-500/60 underline-offset-4 hover:text-sky-100" href="/">
        Back to leaders
      </Link>
    </div>
  );
}
