import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
}

// Blog posts - add your content here
const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Pass First, Die Second. Ennis Whatley',
    excerpt: 'Nothing but Assists Here.',
    date: '2026-01-30',
    slug: 'EnnisWhatley'
  },
  {
    id: '2',
    title: 'Another Discovery',
    excerpt: 'Describe another interesting finding from your Uniqorn analysis.',
    date: '2026-01-30',
    slug: 'another-discovery'
  }
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-sky-200 mb-4">Uniqorn Blog</h1>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          Discoveries, insights, and stories from the intersection of NBA statistics and uniqueness.
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => (
          <article 
            key={post.id}
            className="bg-zinc-900/60 rounded-2xl border border-sky-400/20 p-6 hover:border-sky-400/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-semibold text-sky-200 hover:text-sky-100 transition-colors mb-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-zinc-300 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <time className="text-sm text-zinc-400">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-sky-300 hover:text-sky-200 text-sm font-medium transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {blogPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No blog posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
