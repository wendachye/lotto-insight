'use client';

import { DateRangeSelector } from '@/components/DateRangeSelector';
import { WinningCountChart } from '@/components/WinningCountChart';
import { WinningCumulativeChart } from '@/components/WinningCumulativeChart';
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
    // queryFn: async () => {
    //   const res = await axios.get<{
    //     results: PivotedResult[];
    //     hasNextPage: boolean;
    //     oldestDate: string;
    //     latestDate: string;
    //   }>(`/api/results?date=${dayjs().format('YYYY-MM-DD')}&size=${size}`);
    //   return res.data;
    // },
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
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}

      {!isFetching && isSuccess && (
        <>
          <WinningCountChart data={data.results} />
          <WinningCumulativeChart data={data.results} />
        </>
      )}
    </div>
  );
}
