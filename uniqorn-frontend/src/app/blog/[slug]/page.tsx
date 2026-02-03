import { notFound } from 'next/navigation';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  slug: string;
}

// Blog posts - add your content here
const blogPosts: Record<string, BlogPost> = {
  'EnnisWhatley': {
    id: '1',
    title: 'Pass First, Die Second. Ennis Whatley',
    content: `
## 1 Point, 0 Rebounds, 0 Blocks, 1 Steal.......21 Assists.

My hope in creating Uniqorn was to uncover the untold my-way-or-the-highway players, players who played their game their way. Players who didn't fit the mold, players who statlines give you pause. Ennis Whatley was a Uniqorn.
When you look up weirdest statlines in NBA history, you'll often find Dennis Rodman's games where he decided rebounding is all he cares about. And yes, Dennis has 3 ultimate uniqorn games himself, all with rebound totals over 20, mind you. However, no one talks about Ennis Whatley. Who much like Dennis, decided to dedicate each game to one stat: for him assists.
Ennis Whatley has two such ultimate uniqorn games, the same amount as Lebron. I want to hone in on one. On February 23, 1985, Ennis' Chicago Bulls were hosting the Golden State Warriors, a game they would win comfortably 140-125. MJ put up 38/6/1/0/2, and Orlando Woolridge 26/2/4/2/1 to oust the silly names of Purvis Short and Sleepy Floyd. Ennis would come off the bench and play 31 minutes, put up three shots, and miss all of them. He'd get either 1 or 2 steals, depending on whether you ask the NBA or Basketball Reference. I went with the former. He grabbed no boards and blocked no shots. He got fouled once and made 1 of his 2 free throws. He would call it a night there. Oh, sorry. I forgot about his 21 assists.
- Point 1 about your finding
- Point 2 with more details
- Point 3 concluding thought

## Another Section

Continue writing your analysis here. You can include as many sections as needed.
    `,
    date: '2026-01-30',
    slug: 'EnnisWhatley'
  },
  'another-discovery': {
    id: '2',
    title: 'Another Discovery',
    content: `
# Another Discovery

Write your second blog post content here.

## Interesting Finding

Describe what you discovered in the Uniqorn data.

## Analysis

Explain why this finding is interesting and what it tells us about NBA statistics.

## Conclusion

Summarize your insights and what readers should take away from this analysis.
    `,
    date: '2026-01-30',
    slug: 'another-discovery'
  }
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/blog" 
          className="text-sky-300 hover:text-sky-200 text-sm font-medium transition-colors"
        >
          ← Back to Blog
        </Link>
      </div>

      <article className="bg-zinc-900/60 rounded-2xl border border-sky-400/20 p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-sky-200 mb-4">
            {post.title}
          </h1>
          <time className="text-sm text-zinc-400">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </header>

        <div className="prose prose-invert prose-sky max-w-none">
          {post.content.split('\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return <h2 key={index} className="text-2xl font-bold text-sky-200 mt-8 mb-4">{paragraph.slice(2)}</h2>;
            } else if (paragraph.startsWith('## ')) {
              return <h3 key={index} className="text-xl font-semibold text-sky-300 mt-6 mb-3">{paragraph.slice(3)}</h3>;
            } else if (paragraph.startsWith('### ')) {
              return <h4 key={index} className="text-lg font-medium text-sky-300 mt-4 mb-2">{paragraph.slice(4)}</h4>;
            } else if (paragraph.startsWith('- ')) {
              return <li key={index} className="text-zinc-300 ml-4">{paragraph.slice(2)}</li>;
            } else if (paragraph.trim() === '') {
              return <br key={index} />;
            } else {
              return <p key={index} className="text-zinc-300 leading-relaxed mb-4">{paragraph}</p>;
            }
          })}
        </div>
      </article>
    </div>
  );
}
