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
        Each game is then weighted by how frequently that exact bucketed profile appears league-wide during the season. Unique profiles contribute more to a player's score, while common ones contribute less. Over time, this captures both the uniqueness <em>and</em> the consistency of distinctive performances. Crucially, the index is era-aware — a triple-double in a season full of triple-doubles simply does not mean the same thing as one in a season where they are scarce.
      </p>

      <h2 className="text-sky-200">What is a Uniqorn Game?</h2>
      <p>
        A Uniqorn game is a single performance whose bucketed statline occurs exactly once within a given season. Because the buckets are season-specific and intentionally constrained, a Uniqorn game reflects something genuinely distinct relative to that year’s statistical environment, not an accident of overly precise metrics.
      </p>
      <p>
        These games tend to live in rarely visited regions of stat space — whether through extreme production, strange combinations of numbers, or unlikely intersections of skills that the league almost never produces at the same time.
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
          This bucket shape has only ever occurred once in NBA history (1973–present). Hakeem's blend of scoring, rebounding, shot-blocking, and steals on this night occupies a region of stat space that no other player has ever matched.
        </p>
      </div>

      <h2 className="text-sky-200">How the score is built</h2>
      <ul>
        <li>Each game is bucketed by points, assists, rebounds, blocks, and steals.</li>
        <li>Within a season, we count how often each bucketed stat shape appears league-wide.</li>
        <li>Every game receives a weighted uniqueness score based on that season’s frequencies.</li>
        <li>Players are ranked by their average weighted uniqueness over the season.</li>
      </ul>

      <h2 className="text-sky-200">Why buckets?</h2>
      <p>
        Buckets smooth out minor statistical noise while preserving meaningful differences. A 23/8/7 game and a 24/8/7 game fall into the same bucket, ensuring the index rewards overall shape rather than tiny fluctuations. This keeps the metric stable while still surfacing truly rare combinations.
      </p>

      <h2 className="text-sky-200">Ultimate Uniqorn</h2>
      <p>
        Beyond single-season Uniqorn games, we also track <strong>Ultimate Uniqorn</strong> performances — statline buckets that have occurred exactly once across all seasons from 1973 to the present. These games are historically singular, representing the rarest intersections of skills the NBA has ever seen.
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
        Built using NBA box-score data and modern data science techniques. The Uniqorn Index is bucket-driven, era-aware, and designed to celebrate the truly distinct corners of basketball history.
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
          Used alongside traditional stats, the Uniqorn Index excels at highlighting diverse skill sets, uncovering strange and beautiful outliers, and showing how the league’s statistical shape changes over time. It’s not a definitive ranking — it’s a celebration of how many different ways basketball can look.
        </p>
      </div>
    </div>
  );
}
