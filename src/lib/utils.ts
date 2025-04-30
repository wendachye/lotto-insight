import { FlatResult, PivotedResult } from '@/types/results';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupResultsByDate(data: FlatResult[]): PivotedResult[] {
  const grouped = new Map<string, PivotedResult>();

  data.forEach(({ draw_date, company, result_no }) => {
    if (!grouped.has(draw_date)) {
      grouped.set(draw_date, { draw_date });
    }
    grouped.get(draw_date)![company] = result_no;
  });

  return Array.from(grouped.values());
}

export function hasDuplicateInLastThreeDigits(number: number | string | null | undefined): boolean {
  if (number === null || number === undefined) return false;
  number = number.toString().padStart(4, '0');
  const lastThree = number.slice(-3);
  return (
    lastThree[0] === lastThree[1] || lastThree[1] === lastThree[2] || lastThree[0] === lastThree[2]
  );
}
