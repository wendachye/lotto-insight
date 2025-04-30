'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { useState } from 'react';

export default function ScraperPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleScrape = async () => {
    if (!startDate) {
      setStatus('error');
      setMessage('Start date is required.');
      return;
    }

    const format = (d: string) => d.replace(/-/g, '');
    const range = `${format(startDate)}-${endDate ? format(endDate) : ''}`;

    try {
      setStatus('loading');
      setMessage('');
      const res = await axios.get(`/api/scrape?dateRange=${range}`);
      setStatus('success');
      setMessage(res.data.message || 'Scraping started.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Lotto Scraper</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">End Date (optional)</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Button onClick={handleScrape} disabled={status === 'loading'}>
          {status === 'loading' ? 'Scraping...' : 'Start Scrape'}
        </Button>

        {status !== 'idle' && (
          <div className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
