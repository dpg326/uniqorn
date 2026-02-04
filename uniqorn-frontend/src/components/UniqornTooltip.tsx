'use client';

interface UniqornScoreProps {
  score: number;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 0.65) {
    return { label: 'Elite', color: 'text-purple-400' };
  } else if (score >= 0.55) {
    return { label: 'Exceptional', color: 'text-pink-400' };
  } else if (score >= 0.45) {
    return { label: 'Very Good', color: 'text-sky-400' };
  } else if (score >= 0.35) {
    return { label: 'Above Average', color: 'text-sky-300' };
  } else {
    return { label: 'Common', color: 'text-zinc-400' };
  }
}

export default function UniqornScore({ score }: UniqornScoreProps) {
  const { label, color } = getScoreLabel(score);

  return (
    <div className="text-right">
      <div className="font-semibold text-sky-300">
        {score.toFixed(4)}
      </div>
      <div className={`text-[10px] ${color} font-medium`}>
        {label}
      </div>
    </div>
  );
}
