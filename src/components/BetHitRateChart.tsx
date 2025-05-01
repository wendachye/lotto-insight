import { COMPANIES } from '@/lib/constants';
import { getBetHitRate } from '@/lib/utils';
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

export function BetHitRateChart({ data }: { data: PivotedResult[] }) {
  const strategy = getBetHitRate(data);

  const chartData = COMPANIES.map((company) => {
    const entry = strategy[company] ?? { bets: 0, hits: 0, hitRate: 0 };
    return {
      company: company.charAt(0).toUpperCase() + company.slice(1),
      bets: entry.bets,
      hits: entry.hits,
      hitRate: entry.hitRate,
    };
  });

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Betting Hit Rate Performance</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" />
          <YAxis yAxisId="left" allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="bets" fill="#9CA3AF" name="Bets" />
          <Bar yAxisId="left" dataKey="hits" fill="#10B981" name="Hits" />
          <Bar yAxisId="right" dataKey="hitRate" fill="#3B82F6" name="Hit Rate (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
