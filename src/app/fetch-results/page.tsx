'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full max-w-[250px] justify-start text-left font-normal cursor-pointer',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'yyyy-MM-dd') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2 cursor-pointer">
        <Label>End Date (optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full max-w-[250px] justify-start text-left font-normal cursor-pointer',
                !endDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'yyyy-MM-dd') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
          </PopoverContent>
        </Popover>
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
