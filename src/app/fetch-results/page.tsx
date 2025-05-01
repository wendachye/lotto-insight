'use client';

import { Button } from '@/components/ui/button';
import { EditableDatePicker } from '@/components/ui/datepicker';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';

export default function FetchResultPage() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const scrapeMutation = useMutation({
    mutationFn: async ({ startDate, endDate }: { startDate: Date; endDate?: Date }) => {
      const formatDate = (d: Date) => format(d, 'yyyyMMdd');
      const range = `${formatDate(startDate)}-${endDate ? formatDate(endDate) : ''}`;

      const res = await fetch(`/api/scrape?dateRange=${range}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to scrape.');
      }

      return await res.json();
    },
    onMutate: () => {
      setStatus('loading');
      setMessage('');
    },
    onSuccess: (data) => {
      setStatus('success');
      setMessage(`Results fetched successfully. ${data.inserted} records inserted.`);
    },
    onError: (err: any) => {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    },
  });

  const handleScrape = () => {
    if (!startDate) {
      setStatus('error');
      setMessage('Start date is required.');
      return;
    }

    scrapeMutation.mutate({ startDate, endDate });
  };

  return (
    <div className="p-6 space-y-6 max-w-sm">
      <h1 className="text-2xl font-semibold">Fetch Results</h1>

      <div className="space-y-2">
        <EditableDatePicker
          label="Start Date"
          date={startDate}
          placeholder="Pick a date (YYYY-MM-DD)"
          onChange={setStartDate}
        />
      </div>

      <div className="space-y-2 cursor-pointer">
        <EditableDatePicker
          label="End Date (optional)"
          date={endDate}
          placeholder="Pick a date (YYYY-MM-DD)"
          onChange={setEndDate}
        />
      </div>

      <Button className="cursor-pointer" onClick={handleScrape} disabled={scrapeMutation.isPending}>
        {scrapeMutation.isPending ? 'Fectching...' : 'Start Fetching'}
      </Button>

      {status !== 'idle' && (
        <div className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
