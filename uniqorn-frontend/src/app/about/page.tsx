export default function Page() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-100">What is Uniqorn?</h1>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          A measure of statistical uniqueness in NBA performances. Inspired by Jon Bois' <em>Scorigami</em>, we ask: how often does a game like <em>this</em> really happen?
        </p>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-sky-400/20 bg-zinc-900/60 backdrop-blur-sm p-6 md:p-8 space-y-8">
        
        {/* The Index */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-sky-200">The Uniqorn Index</h2>
          <p className="text-zinc-300 leading-relaxed">
            The Uniqorn Index measures how unique a player's statistical profile is within a season. We group performances into buckets (e.g., 21-25 points, 6-8 assists) and weight each game by how rare that combination is league-wide. Less common profiles score higher. The index is era-aware — a triple-double in a season full of them doesn't score the same as one when they're scarce.
          </p>
        </section>

        {/* Uniqorn Games */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-sky-200">Uniqorn Games</h2>
          <p className="text-zinc-300 leading-relaxed">
            A Uniqorn game is a performance whose bucketed statline occurs exactly once within a season. These typically involve unusual combinations across multiple categories — high volume in one area paired with moderate output in others, or balanced contributions that rarely align.
          </p>
        </section>

        {/* Example Chart */}
        <section className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-zinc-400 italic">Example: Hakeem Olajuwon's Ultimate Uniqorn (1990-03-26)</p>
          <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border border-sky-400/20">
            <iframe
              src="/api/generate-chart?firstName=Hakeem&lastName=Olajuwon&game_date=1990-03-26&points=27&rebounds=18&assists=3&blocks=6&steals=4&isUltimate=true"
              title="Hakeem Olajuwon Ultimate Uniqorn radar chart"
              className="w-full h-full border-none"
            />
          </div>
          <p className="text-xs text-zinc-400 text-center">
            27 PTS / 18 REB / 3 AST / 6 BLK / 4 STL — This bucket has occurred once in NBA history (1973–present)
          </p>
        </section>

        {/* How It Works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-sky-200">How It Works</h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium text-sky-300 mb-2">1. Bucketing</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Stats are grouped into ranges: Points (0-5, 6-10, 11-15...), Rebounds (0-2, 3-5, 6-10...), Assists (0-2, 3-5, 6-8...), Blocks, and Steals. A 23/11/8/2/3 game becomes bucket (21-25, 11-15, 6-8, 2-3, 2-3).
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-sky-300 mb-2">2. Scoring</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Each game gets a score using <span className="font-mono text-sky-400">e^(-0.10 × effective_count)</span> where effective_count is how many times that bucket appears (excluding the player's own games). Rarer buckets score closer to 1.0, common ones closer to 0.0.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-sky-300 mb-2">3. Season Average</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                A player's Uniqorn Index is the average of all their game scores. This rewards both uniqueness and consistency.
              </p>
            </div>
          </div>
          
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <p className="text-sm text-zinc-400">
              <strong className="text-zinc-300">Score Scale:</strong> 0.65+ (Elite, top 1%) • 0.55-0.64 (Exceptional, top 5%) • 0.45-0.54 (Very Good, top 20%) • 0.35-0.44 (Above Average) • Below 0.35 (Common)
            </p>
          </div>
        </section>

        {/* Ultimate Uniqorn */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-sky-200">Ultimate Uniqorn</h2>
          <p className="text-zinc-300 leading-relaxed">
            Beyond single-season Uniqorn games, we track <strong>Ultimate Uniqorn</strong> performances — statline buckets that have occurred exactly once across all seasons from 1973 to present. These are the rarest statistical combinations in modern NBA history.
          </p>
        </section>

        {/* Limitations */}
        <section className="space-y-3 border-t border-zinc-700 pt-6">
          <h2 className="text-2xl font-semibold text-sky-200">Limitations</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            This measures statistical uniqueness, not player value. Bucket boundaries are arbitrary, game context is ignored, and data only goes back to 1973 (when blocks/steals were first recorded). Use alongside traditional stats to explore diverse skill sets and statistical outliers.
          </p>
        </section>

        {/* Data Source */}
        <section className="space-y-2 text-sm">
          <p className="text-zinc-400">
            <strong className="text-zinc-300">Data Source:</strong> All NBA game data from the{' '}
            <a 
              href="https://www.kaggle.com/datasets/eoinamoore/historical-nba-data-and-player-box-scores" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              Historical NBA Data and Player Box Scores dataset
            </a>
            {' '}on Kaggle.
          </p>
        </section>
      </div>
    </div>
  );
}
