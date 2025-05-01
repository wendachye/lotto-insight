'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { COLORS, COMPANIES } from '@/lib/constants';
import { hasDuplicateInLastThreeDigits } from '@/lib/utils';
import { PivotedResult } from '@/types/results';
import { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export function WinningPercentageChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useIsMobile();
  const [hiddenCompanies, setHiddenCompanies] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    return COMPANIES.map((company) => {
      let winning = 0;
      for (const row of data) {
        const value = row[company];
        if (value && hasDuplicateInLastThreeDigits(value)) {
          winning++;
        }
      }
      return {
        company,
        name: company.charAt(0).toUpperCase() + company.slice(1),
        value: winning,
      };
    }).filter((entry) => entry.value > 0);
  }, [data]);

  const visibleData = counts.filter((c) => !hiddenCompanies.has(c.company));
  const totalWins = visibleData.reduce((sum, item) => sum + item.value, 0);

  const chartData = visibleData.map((entry) => ({
    ...entry,
    percentage: ((entry.value / totalWins) * 100).toFixed(1) + '%',
  }));

  const toggleCompany = (id: string) => {
    setHiddenCompanies((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isMobile ? 10 : 12}
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const legendPayload = counts.map((entry, i) => ({
    value: `${entry.name} (${entry.value})`,
    id: entry.company,
    color: COLORS[i % COLORS.length],
    inactive: hiddenCompanies.has(entry.company),
  }));

  return (
    <div className="w-full p-2">
      <h2 className="text-lg font-semibold mb-4">Winning Percentage by Company</h2>
      <ResponsiveContainer width="100%" aspect={isMobile ? 0.8 : 1.6}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={140}
            label={renderCustomLabel}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [`${value}`, `Company: ${name}`]} />
          <Legend
            payload={legendPayload}
            onClick={(e: any) => toggleCompany(e.id)}
            wrapperStyle={{ cursor: 'pointer' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
