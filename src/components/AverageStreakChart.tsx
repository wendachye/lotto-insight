'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { COMPANIES } from '@/lib/constants';
import { getAverageStreaks } from '@/lib/utils';
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

export function AverageStreakChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useIsMobile();
  const streaks = getAverageStreaks(data);

  const chartData = COMPANIES.map((company) => {
    const s = streaks.find((s) => s.company === company);
    return {
      company: company.charAt(0).toUpperCase() + company.slice(1),
      averageWin: s?.averageWin ?? 0,
      averageLose: s?.averageLose ?? 0,
    };
  });

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded border bg-white p-2 shadow">
        <div className="font-semibold">{data.company}</div>
        <div className="text-sm text-green-600">Average Win Streak: {data.averageWin}</div>
        <div className="text-sm text-red-600 mt-1">Average Lose Streak: {data.averageLose}</div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Average Win/Lose Streaks</h2>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" />
          <YAxis allowDecimals={false} />
          <Tooltip content={renderTooltip} />
          <Legend />
          <Bar dataKey="averageWin" fill="#10B981" name="Average Win" />
          <Bar dataKey="averageLose" fill="#EF4444" name="Average Lose" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
