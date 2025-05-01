'use client';

import { COMPANIES } from '@/lib/constants';
import { hasDuplicateInLastThreeDigits } from '@/lib/utils';
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

type ChartRow = {
  company: string;
  total: number;
  winning: number;
};

export function WinningCountChart({ data }: { data: PivotedResult[] }) {
  const chartData: ChartRow[] = COMPANIES.map((company) => {
    let total = 0;
    let dupes = 0;

    for (const row of data) {
      const value = row[company];
      if (value) {
        total++;
        if (hasDuplicateInLastThreeDigits(value)) {
          dupes++;
        }
      }
    }

    return {
      company: company.charAt(0).toUpperCase() + company.slice(1),
      total,
      winning: dupes,
    };
  });

  return (
    <div className="mt-8">
      <h2 className="text-lg sm:text-xl font-semibold">Winning Count</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="company" />
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(value: any, name: string, props: any) => {
              if (name === 'Winning') {
                const total = props.payload.total;
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return [`${value} (${percent}%)`, name];
              }
              return [value, name];
            }}
          />
          <Legend />
          <Bar dataKey="total" fill="#9CA3AF" name="Total" />
          <Bar dataKey="winning" fill="#3B82F6" name="Winning" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
