'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { COMPANIES } from '@/lib/constants';
import { groupResultsByDate, hasDuplicateInLastThreeDigits } from '@/lib/utils';
import { FlatResult, PivotedResult } from '@/types/results';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function ResultsPage() {
  const { ref: loadMoreRef, inView } = useInView({ triggerOnce: false });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [anchorDate, setAnchorDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [results, setResults] = useState<PivotedResult[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [oldestDate, setOldestDate] = useState<string | null>(null);
  const [latestDate, setLatestDate] = useState<string | null>(null);

  const size = 150;
  const { data, isSuccess, isError, isFetching } = useQuery({
    queryKey: ['results', anchorDate, sortOrder],
    queryFn: async () => {
      const res = await axios.get<{
        results: FlatResult[];
        hasNextPage: boolean;
        oldestDate: string;
        latestDate: string;
      }>(`/api/results?date=${anchorDate}&sort=${sortOrder}&size=${size}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      const pivoted = groupResultsByDate(data.results);

      setResults((prev) => {
        const map = new Map(prev.map((r) => [r.draw_date, r]));
        for (const row of pivoted) {
          map.set(row.draw_date, row);
        }
        return Array.from(map.values()).sort((a, b) =>
          sortOrder === 'asc'
            ? a.draw_date.localeCompare(b.draw_date)
            : b.draw_date.localeCompare(a.draw_date)
        );
      });

      setOldestDate(data.oldestDate);
      setLatestDate(data.latestDate);

      setHasMore(data.hasNextPage);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (inView && hasMore && !isFetching) {
      handleLoadMore();
    }
  }, [inView, hasMore, isFetching]);

  const handleLoadMore = () => {
    const lastDate = results[results.length - 1]?.draw_date;
    if (!lastDate) return;

    const nextAnchor =
      sortOrder === 'desc' ? dayjs(lastDate).subtract(1, 'day') : dayjs(lastDate).add(1, 'day');

    setAnchorDate(nextAnchor.format('YYYY-MM-DD'));
  };

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    const newAnchorDate =
      newSortOrder === 'asc'
        ? (oldestDate ?? dayjs().format('YYYY-MM-DD'))
        : (latestDate ?? dayjs().format('YYYY-MM-DD'));

    setResults([]);
    setSortOrder(newSortOrder);
    setAnchorDate(newAnchorDate);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Results</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={handleSort}>
              Date {sortOrder === 'asc' ? '↑' : '↓'}
            </TableHead>
            {COMPANIES.map((company) => (
              <TableHead key={company}>
                {company.charAt(0).toUpperCase() + company.slice(1)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((row) => (
            <TableRow key={row.draw_date}>
              <TableCell>{row.draw_date}</TableCell>
              {/* {COMPANIES.map((company) => (
                <TableCell key={company}>{row[company] ?? '-'}</TableCell>
              ))} */}
              {COMPANIES.map((company) => {
                const value = row[company];
                const shouldHighlight = hasDuplicateInLastThreeDigits(value);
                return (
                  <TableCell
                    key={company}
                    className={shouldHighlight ? 'bg-yellow-100 font-semibold text-red-700' : ''}
                  >
                    {value ?? '-'}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isError && <p className="text-red-600">Failed to load results.</p>}

      {hasMore && (
        <div ref={loadMoreRef} className="h-12 flex items-center justify-center">
          <span className="text-sm text-gray-500">{isFetching && 'Loading more...'}</span>
        </div>
      )}

      {!hasMore && <p className="text-center text-sm text-gray-500">No more results to load.</p>}
    </div>
  );
}
