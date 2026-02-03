import UltimateUniqornsChart from '@/components/UltimateUniqornsChart';
import UniqornTrendsChart from '@/components/UniqornTrendsChart';

export default function VisualizationsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-200 mb-4">Uniqorn Visualizations</h1>
        <p className="text-lg text-zinc-300 max-w-3xl mx-auto">
          Explore the patterns and trends behind the NBA's most unique statistical performances.
        </p>
      </div>

      <div className="space-y-28 pb-12">
        <UltimateUniqornsChart />
        <UniqornTrendsChart />
      </div>
    </div>
  );
}
