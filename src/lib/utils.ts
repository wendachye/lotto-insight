import { PivotedResult, StreakResult } from '@/types/results';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { COMPANIES } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasDuplicateInLastThreeDigits(number: number | string | null | undefined): boolean {
  if (number === null || number === undefined) return false;
  number = number.toString().padStart(4, '0');
  const lastThree = number.slice(-3);
  return (
    lastThree[0] === lastThree[1] || lastThree[1] === lastThree[2] || lastThree[0] === lastThree[2]
  );
}

export function getLast3DigitPattern(num: string): string {
  const last3 = num.padStart(4, '0').slice(-3).split('');
  const map = new Map<string, string>();
  let charCode = 65; // 'A'

  return last3
    .map((d) => {
      if (!map.has(d)) {
        map.set(d, String.fromCharCode(charCode));
        charCode++;
      }
      return map.get(d)!;
    })
    .join('');
}

export function isUniqueLast3Pattern(pattern: string): boolean {
  return new Set(pattern).size === 3;
}

export function formatQuarter(date: Date): string {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  const year = date.getFullYear();
  return `Q${quarter}-${year}`;
}

export function analyzeStreaks(data: PivotedResult[]): StreakResult[] {
  const sorted = [...data].sort((a, b) => a.draw_date.localeCompare(b.draw_date));
  const results: StreakResult[] = [];

  for (const company of COMPANIES) {
    let currentType: 'win' | 'lose' | null = null;
    let currentLength = 0;
    let currentStart: string | null = null;
    let maxWin: StreakResult | null = null;
    let maxLose: StreakResult | null = null;

    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];
      const value = row[company];

      if (!value) continue; // Skip if the company didn’t draw on this date

      const isWin = hasDuplicateInLastThreeDigits(value);
      const type: 'win' | 'lose' = isWin ? 'win' : 'lose';

      if (type !== currentType) {
        if (currentType && currentStart) {
          const endDate = sorted
            .slice(0, i)
            .reverse()
            .find((r) => r[company])?.draw_date;

          const streak: StreakResult = {
            company,
            type: currentType,
            length: currentLength,
            startDate: currentStart,
            endDate: endDate ?? currentStart,
          };

          if (currentType === 'win') {
            if (!maxWin || streak.length > maxWin.length) maxWin = streak;
          } else {
            if (!maxLose || streak.length > maxLose.length) maxLose = streak;
          }
        }

        // Start new streak
        currentType = type;
        currentLength = 1;
        currentStart = row.draw_date;
      } else {
        currentLength++;
      }
    }

    // Final streak
    if (currentType && currentStart) {
      const endDate = sorted
        .slice()
        .reverse()
        .find((r) => r[company])?.draw_date;

      const finalStreak: StreakResult = {
        company,
        type: currentType,
        length: currentLength,
        startDate: currentStart,
        endDate: endDate ?? currentStart,
      };

      if (currentType === 'win') {
        if (!maxWin || finalStreak.length > maxWin.length) maxWin = finalStreak;
      } else {
        if (!maxLose || finalStreak.length > maxLose.length) maxLose = finalStreak;
      }
    }

    if (maxWin) results.push(maxWin);
    if (maxLose) results.push(maxLose);
  }

  return results;
}
