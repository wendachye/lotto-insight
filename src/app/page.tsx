'use client';

import { DateRangeSelector } from '@/components/DateRangeSelector';
import { WinningCountChart } from '@/components/WinningCountChart';
import { Skeleton } from '@/components/ui/skeleton';
import { FlatResult } from '@/types/results';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';

export default function HomePage() {
  const [size, setSize] = useState(365);
  const { data, isSuccess, isFetching } = useQuery({
    queryKey: ['results', size],
    queryFn: async () => {
      const res = await axios.get<{
        results: FlatResult[];
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

      {isFetching && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}

      <DateRangeSelector value={size} onChange={setSize} />

      {isSuccess && <WinningCountChart data={data.results} />}
    </div>
  );
}
