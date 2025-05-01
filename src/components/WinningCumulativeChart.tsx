'use client';

import { COMPANIES } from '@/lib/constants';
import { hasDuplicateInLastThreeDigits } from '@/lib/utils';
import { PivotedResult } from '@/types/results';
import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ChartPoint = {
  draw_date: string;
} & Record<string, number | string>;

export function WinningCumulativeChart({ data }: { data: PivotedResult[] }) {
  const sorted = [...data].sort((a, b) => a.draw_date.localeCompare(b.draw_date));
  const cumulativeTotals: Record<string, number> = {};
  const chartData: ChartPoint[] = [];

  for (const company of COMPANIES) {
    cumulativeTotals[company] = 0;
  }

  for (const row of sorted) {
    const point: ChartPoint = { draw_date: row.draw_date };

    for (const company of COMPANIES) {
      const val = row[company];
      if (val && hasDuplicateInLastThreeDigits(val)) {
        cumulativeTotals[company]++;
      }
      point[company] = cumulativeTotals[company];
    }

    chartData.push(point);
  }

  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COMPANIES.map((c) => [c, true]))
  );

  const handleLegendClick = (dataKey: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Cumulative Winning Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          key={Object.values(visibleLines).join('')} // Ensures chart reinitializes cleanly
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="draw_date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend
            onClick={(e: any) => handleLegendClick(e.dataKey)}
            payload={COMPANIES.map((company) => ({
              value: company.charAt(0).toUpperCase() + company.slice(1),
              id: company,
              dataKey: company,
              type: 'line',
              color: `hsl(${(COMPANIES.indexOf(company) * 50) % 360}, 70%, 50%)`,
              inactive: !visibleLines[company],
            }))}
          />
          {COMPANIES.map((company) =>
            visibleLines[company] ? (
              <Line
                key={`line-${company}`}
                type="monotone"
                dataKey={company}
                strokeWidth={2}
                stroke={`hsl(${(COMPANIES.indexOf(company) * 50) % 360}, 70%, 50%)`}
                dot={false}
                isAnimationActive={false}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
