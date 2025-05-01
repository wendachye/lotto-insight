'use client';

import { COLORS, COMPANIES } from '@/lib/constants';
import { getLast3DigitPattern, isUniqueLast3Pattern } from '@/lib/utils';
import { PivotedResult } from '@/types/results';
import { useMediaQuery } from '@react-hook/media-query';
import { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export function DigitPatternChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useMediaQuery('only screen and (max-width: 767px)');

  const [hiddenPatterns, setHiddenPatterns] = useState<Set<string>>(new Set());

  const patternMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data) {
      for (const company of COMPANIES) {
        const value = row[company];
        if (!value) continue;
        const pattern = getLast3DigitPattern(value);
        if (isUniqueLast3Pattern(pattern)) continue;
        map.set(pattern, (map.get(pattern) ?? 0) + 1);
      }
    }
    return map;
  }, [data]);

  const chartData = Array.from(patternMap.entries())
    .map(([pattern, count]) => ({ name: pattern, value: count }))
    .sort((a, b) => b.value - a.value)
    .filter((entry) => !hiddenPatterns.has(entry.name));

  const togglePattern = (pattern: string) => {
    setHiddenPatterns((prev) => {
      const copy = new Set(prev);
      if (copy.has(pattern)) copy.delete(pattern);
      else copy.add(pattern);
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
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10}>
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const legendPayload = Array.from(patternMap.entries()).map(([pattern, count], index) => ({
    value: `${pattern} (${count})`,
    color: COLORS[index % COLORS.length],
    id: pattern,
    inactive: hiddenPatterns.has(pattern),
  }));

  return (
    <div className="w-full p-2">
      <h2 className="text-lg font-semibold mb-4">Digit Pattern Distribution</h2>
      <ResponsiveContainer width="100%" aspect={isMobile ? 0.8 : 1.6}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={140}
            label={renderCustomLabel}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip formatter={(value: number, name: string) => [`${value}`, `Pattern ${name}`]} />

          <Legend
            payload={legendPayload}
            onClick={(e: any) => togglePattern(e.id)}
            wrapperStyle={{ cursor: 'pointer' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
