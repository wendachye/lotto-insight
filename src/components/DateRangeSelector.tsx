'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  value: number;
  onChange: (range: number) => void;
  className?: string;
}

const RANGE_OPTIONS: { label: string; value: number }[] = [
  { label: '1 Month', value: 30 },
  { label: '3 Months', value: 90 },
  { label: '6 Months', value: 180 },
  { label: '1 Year', value: 365 },
  { label: '3 Years', value: 1095 },
  { label: 'All', value: 0 },
];

export function DateRangeSelector({ value, onChange, className }: DateRangeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2 sm:gap-3', className)}>
      {RANGE_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? 'default' : 'outline'}
          onClick={() => onChange(opt.value)}
          className="flex-1 min-w-[100px] sm:min-w-[120px] md:min-w-fit cursor-pointer"
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
