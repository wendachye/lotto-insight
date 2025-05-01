'use client';

import { DateRangeSelector } from '@/components/DateRangeSelector';
import { DigitPatternChart } from '@/components/DigitPatternChart';
import { StreaksChart } from '@/components/StreaksChart';
import { WinTrendChart } from '@/components/WinTrendChart';
import { WinningCumulativeChart } from '@/components/WinningCumulativeChart';
import { WinningPercentageChart } from '@/components/WinningPercentageChart';
import { Skeleton } from '@/components/ui/skeleton';
import { PivotedResult } from '@/types/results';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';

export default function HomePage() {
  const [size, setSize] = useState(365);
  const { data, isSuccess, isFetching } = useQuery({
    queryKey: ['results', size],
    queryFn: async () => {
      if (size === 0) {
        const res = await axios.get<{
          results: PivotedResult[];
          hasNextPage: boolean;
          oldestDate: string;
          latestDate: string;
        }>(`/api/results?size=0`);
        return res.data;
      }
      const res = await axios.get<{
        results: PivotedResult[];
        hasNextPage: boolean;
        oldestDate: string;
        latestDate: string;
      }>(`/api/results?date=${dayjs().format('YYYY-MM-DD')}&size=${size}`);
      return res.data;
    },
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <DateRangeSelector value={size} onChange={setSize} />

      {isFetching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      )}

      {!isFetching && isSuccess && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WinningCumulativeChart data={data.results} />
          <WinTrendChart data={data.results} />
          <WinningPercentageChart data={data.results} />
          <DigitPatternChart data={data.results} />
          <StreaksChart data={data.results} />
        </div>
      )}
    </div>
  );
}
