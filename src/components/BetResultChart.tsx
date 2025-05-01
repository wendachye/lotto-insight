'use client';

import { getBetResult } from '@/lib/utils';
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

export function BetResultChart({ data }: { data: PivotedResult[] }) {
  const winPrize = 840;
  const betAmount = 280;
  const result = getBetResult(data, winPrize, betAmount);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Betting Outcome by Company</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={result}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalWins" fill="#10B981" name="Total Wins" />
          <Bar dataKey="totalLosses" fill="#F59E0B" name="Total Losses" />
          <Bar dataKey="totalCost" fill="#EF4444" name="Total Cost" />
          <Bar dataKey="netProfit" fill="#3B82F6" name="Net Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
