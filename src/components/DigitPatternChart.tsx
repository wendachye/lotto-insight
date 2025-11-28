'use client';

import { useMemo, useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
  type TooltipProps,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { useIsMobile } from '@/hooks/use-mobile';
import { COLORS, COMPANIES } from '@/lib/constants';
import { getLast3DigitPattern, isUniqueLast3Pattern } from '@/lib/utils';
import type { PivotedResult } from '@/types/results';

export function DigitPatternChart({ data }: { data: PivotedResult[] }) {
  const isMobile = useIsMobile();
  const [hiddenPatterns, setHiddenPatterns] = useState<Set<string>>(new Set());

  // Generate pattern counts
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

  // Sorted full pattern list (preserve for consistent color assignment)
  const allPatterns = useMemo(
    () =>
      Array.from(patternMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([pattern]) => pattern),
    [patternMap]
  );

  // Filtered chart data (respect toggle) – ONLY affects slices, not legend
  const chartData = useMemo(
    () =>
      allPatterns
        .filter((pattern) => !hiddenPatterns.has(pattern))
        .map((pattern) => ({
          name: pattern,
          value: patternMap.get(pattern) ?? 0,
        })),
    [allPatterns, hiddenPatterns, patternMap]
  );

  const togglePattern = (pattern: string) => {
    setHiddenPatterns((prev) => {
      const copy = new Set(prev);
      if (copy.has(pattern)) copy.delete(pattern);
      else copy.add(pattern);
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
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10}>
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const tooltipFormatter: TooltipProps<ValueType, NameType>['formatter'] = (value, name) => [
    `${value as number}`,
    `Pattern ${name}`,
  ];

  // ✅ Custom legend built from ALL patterns, not from chartData/payload
  const renderLegend = () => {
    if (!allPatterns.length) return null;

    return (
      <ul className="flex flex-wrap gap-2 text-xs">
        {allPatterns.map((pattern, index) => {
          const count = patternMap.get(pattern) ?? 0;
          const isHidden = hiddenPatterns.has(pattern);
          const color = COLORS[index % COLORS.length];

          return (
            <li
              key={pattern}
              onClick={() => togglePattern(pattern)}
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
              <span>{`${pattern} (${count})`}</span>
            </li>
          );
        })}
      </ul>
    );
  };

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
            {chartData.map((entry) => {
              const colorIndex = allPatterns.indexOf(entry.name);
              return <Cell key={`cell-${entry.name}`} fill={COLORS[colorIndex % COLORS.length]} />;
            })}
          </Pie>

          <Tooltip formatter={tooltipFormatter} />

          {/* Legend now always shows all patterns */}
          <Legend content={renderLegend} wrapperStyle={{ cursor: 'pointer' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
