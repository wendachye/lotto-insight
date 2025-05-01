'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { COLORS, COMPANIES } from '@/lib/constants';
import { formatQuarter, hasDuplicateInLastThreeDigits } from '@/lib/utils';
import { PivotedResult } from '@/types/results';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
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
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function WinTrendChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useIsMobile();
  const [view, setView] = useState<'monthly' | 'quarterly'>('monthly');

  const chartData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};

    for (const row of data) {
      const date = new Date(row.draw_date);
      const period = view === 'monthly' ? format(date, 'yyyy-MM') : formatQuarter(date); // e.g., Q1-2025

      if (!grouped[period]) grouped[period] = {};

      for (const company of COMPANIES) {
        const val = row[company];
        if (val && hasDuplicateInLastThreeDigits(val)) {
          grouped[period][company] = (grouped[period][company] ?? 0) + 1;
        }
      }
    }

    return Object.entries(grouped)
      .map(([period, counts]) => {
        let sortKey = period;
        if (view === 'quarterly') {
          const [q, year] = period.split('-'); // e.g., Q1-2025
          const quarterNum = Number(q[1]); // Extract number from Q1, Q2, etc.
          sortKey = `${year.padStart(4, '0')}-${quarterNum}`;
        }

        return {
          period,
          sortKey,
          ...COMPANIES.reduce(
            (acc, company) => {
              acc[company] = counts[company] || 0;
              return acc;
            },
            {} as Record<string, number>
          ),
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data, view]);

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wins Trend</h2>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(val) => val && setView(val as 'monthly' | 'quarterly')}
        >
          <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="quarterly">Quarterly</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {COMPANIES.map((company, i) => (
            <Bar
              key={company}
              dataKey={company}
              stackId="a"
              name={company.charAt(0).toUpperCase() + company.slice(1)}
              fill={COLORS[i % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
