'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { COMPANIES } from '@/lib/constants';
import { getLongestStreaks } from '@/lib/utils';
import { PivotedResult } from '@/types/results';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function LongestStreaksChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useIsMobile();
  const streaks = getLongestStreaks(data);

  const chartData = COMPANIES.map((company) => {
    const win = streaks.find((s) => s.company === company && s.type === 'win');
    const lose = streaks.find((s) => s.company === company && s.type === 'lose');
    return {
      company: company.charAt(0).toUpperCase() + company.slice(1),
      win: win?.length ?? 0,
      winStart: win?.startDate ?? '',
      winEnd: win?.endDate ?? '',
      lose: lose?.length ?? 0,
      loseStart: lose?.startDate ?? '',
      loseEnd: lose?.endDate ?? '',
    };
  });

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded border bg-white p-2 shadow">
        <div className="font-semibold">{data.company}</div>
        <div className="text-sm text-green-600">
          Longest Win Streak: {data.win}
          <br />
          {data.winStart} → {data.winEnd}
        </div>
        <div className="text-sm text-red-600 mt-1">
          Longest Lose Streak: {data.lose}
          <br />
          {data.loseStart} → {data.loseEnd}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Longest Win/Lose Streaks</h2>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" />
          <YAxis allowDecimals={false} />
          <Tooltip content={renderTooltip} />
          <Legend />
          <Bar dataKey="win" fill="#10B981" name="Longest Win Streak" />
          <Bar dataKey="lose" fill="#EF4444" name="Longest Lose Streak" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
