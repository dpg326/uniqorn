import Image from 'next/image';

export default function Page() {
  return (
    <div className="prose prose-invert prose-sky max-w-none rounded-xl border border-sky-500/30 bg-zinc-950/40 p-6 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]">
      <h1 className="text-sky-100">What is Uniqorn?</h1>

      <p>
        Uniqorn is an attempt to capture something that often gets lost in traditional basketball stats: how unusual a performance actually is. Inspired by Jon Bois’ concept of <em>Scorigami</em>, Uniqorn treats NBA statlines as points in a vast statistical landscape and asks a simple question — how often does a game like <em>this</em> really happen?
      </p>

      <h2 className="text-sky-200">What is the Uniqorn Index?</h2>
      <p>
        The Uniqorn Index is a season-relative measure of statistical uniqueness. It evaluates how unique a player’s overall statline profile is within the context of a specific NBA season. Rather than assuming every box score is unique by default, the index groups performances into discrete buckets across points, assists, rebounds, blocks, and steals.
      </p>
      <p>
        Each game is weighted by how frequently that bucketed profile appears league-wide during the season. Less common profiles score higher, while frequent ones score lower. This captures both uniqueness and consistency. The index is era-aware — a triple-double in a season full of triple-doubles doesn't score the same as one in a season where they're scarce.
      </p>

      <h2 className="text-sky-200">What is a Uniqorn Game?</h2>
      <p>
        A Uniqorn game is a performance whose bucketed statline occurs exactly once within a given season. Because the buckets are season-specific and intentionally constrained, a Uniqorn game reflects something distinct relative to that year's statistical environment.
      </p>
      <p>
        These games typically involve unusual combinations of production across multiple categories — whether through high volume in one area paired with moderate output in others, or balanced contributions across all five stats that rarely align.
      </p>

      <div className="my-6 flex flex-col items-center gap-2">
        <p className="text-sm text-zinc-400 italic">Example: Hakeem Olajuwon's 1990-03-26 Ultimate Uniqorn</p>
        <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border border-sky-500/20 bg-zinc-900/40">
          <iframe
            src="/api/generate-chart?firstName=Hakeem&lastName=Olajuwon&game_date=1990-03-26&points=27&assists=3&rebounds=18&blocks=6&steals=4&isUltimate=true"
            title="Hakeem Olajuwon Ultimate Uniqorn radar chart"
            className="w-full h-full border-none"
          />
        </div>
        <p className="text-xs text-zinc-400 max-w-prose text-center">
          Statline: 27 PTS / 3 AST / 18 REB / 6 BLK / 4 STL<br />
          This bucket combination has occurred once in NBA history (1973–present). No other game has matched this specific blend of scoring, rebounding, blocks, and steals.
        </p>
      </div>

      <h2 className="text-sky-200">The Mathematics Behind the Index</h2>
      
      <h3 className="text-sky-300">Step 1: Bucketing</h3>
      <p>
        Each stat is grouped into ranges (buckets) to create meaningful categories while reducing noise:
      </p>
      <ul>
        <li><strong>Points:</strong> 0-5, 6-10, 11-15, 16-20, 21-25, 26-30, 31-40, 41-50, 51+</li>
        <li><strong>Assists:</strong> 0-2, 3-5, 6-8, 9-12, 13-20, 21+</li>
        <li><strong>Rebounds:</strong> 0-2, 3-5, 6-10, 11-15, 16-20, 21+</li>
        <li><strong>Blocks:</strong> 0-1, 2-3, 4-5, 6-7, 8+</li>
        <li><strong>Steals:</strong> 0-1, 2-3, 4-5, 6-7, 8+</li>
      </ul>
      <p>
        A game with 23 points, 8 assists, 11 rebounds, 2 blocks, and 3 steals becomes the bucket: <code>(21-25, 6-8, 11-15, 2-3, 2-3)</code>
      </p>

      <h3 className="text-sky-300">Step 2: Counting Frequency</h3>
      <p>
        For each season, we count how many times each unique bucket combination appears across all games played. We also track how many times each player personally contributes to each bucket (for self-exclusion).
      </p>

      <h3 className="text-sky-300">Step 3: Weighted Uniqueness Score (The Key Formula)</h3>
      <p>
        Each game receives a score using an <strong>exponential decay formula</strong> with a self-exclusion mechanism:
      </p>
      <div className="bg-zinc-800/60 border border-sky-500/20 rounded-lg p-4 my-4 font-mono text-sm">
        <p className="text-center mb-3">
          <strong>effective_count = max(total_bucket_count - player_bucket_count, 1)</strong>
        </p>
        <p className="text-center">
          <strong>Game Score = e<sup>-α × effective_count</sup></strong>
        </p>
        <p className="text-center text-zinc-400 text-xs mt-2">
          where α (alpha) = 0.10
        </p>
      </div>
      <p>
        <strong>Self-exclusion:</strong> We subtract the player's own contribution to avoid inflating their score when they repeatedly produce the same bucket.
      </p>
      <p>
        <strong>Example:</strong> If a bucket appears 5 times total, and the player contributed 2 of those:
      </p>
      <ul>
        <li>effective_count = max(5 - 2, 1) = 3</li>
        <li>Game Score = e<sup>-0.10 × 3</sup> = e<sup>-0.30</sup> ≈ 0.7408</li>
      </ul>
      <p>
        This exponential formula means:
      </p>
      <ul>
        <li><strong>Score near 1.0:</strong> Extremely unique (effective_count = 1)</li>
        <li><strong>Score ~0.74:</strong> Moderately unique (effective_count = 3)</li>
        <li><strong>Score ~0.37:</strong> Common (effective_count = 10)</li>
        <li><strong>Score near 0.0:</strong> Very common (effective_count → ∞)</li>
      </ul>

      <h3 className="text-sky-300">Step 4: Player Season Average</h3>
      <p>
        A player's Uniqorn Index for a season is the <strong>average</strong> of all their game scores. This rewards both having unique games <em>and</em> doing it consistently.
      </p>
      <div className="bg-zinc-800/60 border border-sky-500/20 rounded-lg p-4 my-4 font-mono text-sm">
        <p className="text-center">
          <strong>Season Uniqorn Index = (Σ Game Scores) / Games Played</strong>
        </p>
      </div>
      <p>
        The exponential decay with α=0.10 provides a good balance: it dramatically rewards truly unique performances while still distinguishing between moderately rare and common buckets.
      </p>

      <h3 className="text-sky-300">Understanding the Scale</h3>
      <div className="bg-gradient-to-r from-sky-900/40 to-purple-900/40 border border-sky-500/30 rounded-lg p-4 my-4">
        <ul className="space-y-2 my-0">
          <li><strong>0.65+:</strong> Elite uniqueness — Top 1% of all seasons</li>
          <li><strong>0.55-0.64:</strong> Exceptional — Top 5% of seasons</li>
          <li><strong>0.45-0.54:</strong> Very Good — Top 20% of seasons</li>
          <li><strong>0.35-0.44:</strong> Above Average — Top 50% of seasons</li>
          <li><strong>Below 0.35:</strong> Common statistical profile</li>
        </ul>
      </div>

      <h2 className="text-sky-200">Quick Summary</h2>
      <ul>
        <li>Each game is bucketed by points, assists, rebounds, blocks, and steals.</li>
        <li>Within a season, we count how often each bucketed stat shape appears league-wide.</li>
        <li>Every game receives a weighted uniqueness score: <code>e<sup>-0.10 × effective_count</sup></code></li>
        <li>Self-exclusion prevents players from inflating their own scores.</li>
        <li>Players are ranked by their average weighted uniqueness over the season.</li>
      </ul>

      <h2 className="text-sky-200">Why buckets?</h2>
      <p>
        Buckets smooth out minor statistical noise while preserving meaningful differences. A 23/8/7 game and a 24/8/7 game fall into the same bucket, ensuring the index rewards overall shape rather than tiny fluctuations. This keeps the metric stable while still surfacing unique combinations.
      </p>

      <h2 className="text-sky-200">Ultimate Uniqorn</h2>
      <p>
        Beyond single-season Uniqorn games, we also track <strong>Ultimate Uniqorn</strong> performances — statline buckets that have occurred exactly once across all seasons from 1973 to the present. These represent the rarest statistical combinations in modern NBA history.
      </p>

      <h2 className="text-sky-200">How we use it</h2>
      <ul>
        <li>Season leaders: Players with consistently rare stat profiles.</li>
        <li>Top 50 Career: All-time leaders by mean season-level uniqueness.</li>
        <li>Historical browser: Explore leaders year by year.</li>
        <li>Ultimate Uniqorn: Once-in-a-lifetime performances.</li>
      </ul>

      <h2 className="text-sky-200">Credits</h2>
      <p>
        Built using NBA box-score data and exponential decay algorithms. The Uniqorn Index is bucket-driven, era-aware, and designed to surface unusual statistical profiles across basketball history.
      </p>

      <h2 className="text-sky-200">Important Considerations</h2>
      <div className="bg-zinc-800/40 border border-sky-500/20 rounded-lg p-4 my-4">
        <h3 className="text-sky-300 font-semibold mb-2">A Word of Caution</h3>
        <p className="text-zinc-300 mb-3">
          While the Uniqorn Index offers a unique perspective on statistical rarity, it comes with important limitations:
        </p>

        <h4 className="text-sky-200 font-medium mb-1">Arbitrary Bucket Boundaries</h4>
        <p className="text-zinc-300 mb-3">
          Bucket cutoffs (for example, 20–24 points versus 25–29) are inherently arbitrary. They help smooth variation but can create sharp distinctions between performances that are otherwise very similar.
        </p>

        <h4 className="text-sky-200 font-medium mb-1">Context Limitations</h4>
        <p className="text-zinc-300 mb-3">
          The metric ignores game context such as opponent quality, pace, score margin, or stakes. A 30-point game in a blowout is treated the same as one in a high-leverage situation.
        </p>

        <h4 className="text-sky-200 font-medium mb-1">Statistical Completeness</h4>
        <p className="text-zinc-300 mb-3">
          Blocks and steals were not recorded before 1973, which limits historical coverage. The index also excludes efficiency and advanced metrics like plus-minus or defensive impact.
        </p>

        <h4 className="text-sky-200 font-medium mb-1">Purpose and Scope</h4>
        <p className="text-zinc-300 mb-3">
          This is a measure of statistical uniqueness, not player value or overall impact. A rare statline is not necessarily a good or winning one.
        </p>

        <h4 className="text-sky-200 font-medium mb-1">The Value Proposition</h4>
        <p className="text-zinc-300">
          Used alongside traditional stats, the Uniqorn Index highlights diverse skill sets, identifies statistical outliers, and tracks how the league's statistical patterns change over time. It's not a definitive ranking — it's a tool for exploring the variety of ways basketball performance can manifest.
        </p>

        <h4 className="text-sky-200 font-medium mb-1 mt-4">Data Source</h4>
        <p className="text-zinc-300">
          All NBA game data is sourced from the{' '}
          <a 
            href="https://www.kaggle.com/datasets/eoinamoore/historical-nba-data-and-player-box-scores" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline"
          >
            Historical NBA Data and Player Box Scores dataset
          </a>
          {' '}on Kaggle. Data updates may be delayed 1-2 days depending on when the dataset is refreshed.
        </p>
      </div>
    </div>
  );
}
