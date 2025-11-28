'use client';

import { useIsMobile } from '@/hooks/use-mobile';
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
  type LegendProps,
} from 'recharts';

type ChartPoint = {
  draw_date: string;
} & Record<string, number | string>;

export function WinningCumulativeChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useIsMobile();
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

  const toggleLine = (dataKey: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  // Recharts v3: Legend onClick gets the legend item, no manual payload prop
  const handleLegendClick: LegendProps['onClick'] = (item) => {
    if (!item) return;
    const dataKey = (item as any).dataKey as string | undefined;
    if (dataKey) toggleLine(dataKey);
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg sm:text-xl font-semibold">Cumulative Winning Over Time</h2>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
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
            onClick={handleLegendClick}
            formatter={(value, entry) => {
              const dataKey = (entry as any).dataKey as string;
              const label = dataKey
                ? dataKey.charAt(0).toUpperCase() + dataKey.slice(1)
                : String(value);
              const isInactive = !visibleLines[dataKey];

              return (
                <span
                  style={{
                    opacity: isInactive ? 0.4 : 1,
                  }}
                >
                  {label}
                </span>
              );
            }}
          />

          {COMPANIES.map((company, index) =>
            visibleLines[company] ? (
              <Line
                key={`line-${company}`}
                type="monotone"
                dataKey={company}
                strokeWidth={2}
                stroke={`hsl(${(index * 50) % 360}, 70%, 50%)`}
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
