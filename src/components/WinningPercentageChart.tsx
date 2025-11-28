'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { COLORS, COMPANIES } from '@/lib/constants';
import { hasDuplicateInLastThreeDigits } from '@/lib/utils';
import { PivotedResult } from '@/types/results';
import { useMemo, useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from 'recharts';

export function WinningPercentageChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useIsMobile();
  const [hiddenCompanies, setHiddenCompanies] = useState<Set<string>>(new Set());

  const counts = useMemo(
    () =>
      COMPANIES.map((company) => {
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
      }).filter((entry) => entry.value > 0),
    [data]
  );

  const visibleData = counts.filter((c) => !hiddenCompanies.has(c.company));
  const totalWins = visibleData.reduce((sum, item) => sum + item.value, 0);

  const chartData = visibleData.map((entry) => ({
    ...entry,
    percentage: totalWins > 0 ? ((entry.value / totalWins) * 100).toFixed(1) + '%' : '0.0%',
  }));

  const toggleCompany = (id: string) => {
    setHiddenCompanies((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const {
      cx = 0,
      cy = 0,
      midAngle = 0,
      innerRadius = 0,
      outerRadius = 0,
      percent = 0,
      name,
    } = props;

    if (!name) return null;

    const RADIAN = Math.PI / 180;
    const inner = Number(innerRadius) || 0;
    const outer = Number(outerRadius) || 0;
    const radius = inner + (outer - inner) * 0.5;

    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

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

  const renderLegend = () => {
    if (!counts.length) return null;

    return (
      <ul className="flex flex-wrap gap-2 text-xs">
        {counts.map((entry) => {
          const isHidden = hiddenCompanies.has(entry.company);
          const color = COLORS[COMPANIES.indexOf(entry.company) % COLORS.length];

          return (
            <li
              key={entry.company}
              onClick={() => toggleCompany(entry.company)}
              style={{
                cursor: 'pointer',
                opacity: isHidden ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: color,
                  border: isHidden ? '1px dashed #999' : 'none',
                  display: 'inline-block',
                }}
              />
              <span>{`${entry.name} (${entry.value})`}</span>
            </li>
          );
        })}
      </ul>
    );
  };

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
            {chartData.map((entry) => (
              <Cell
                key={entry.company}
                fill={COLORS[COMPANIES.indexOf(entry.company) % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip formatter={(value: number, name: string) => [`${value}`, `Company: ${name}`]} />

          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
