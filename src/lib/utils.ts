import {
  AverageStreakResult,
  BetResult,
  HitRateResult,
  LongestStreakResult,
  PivotedResult,
} from '@/types/results';
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

export function getLongestStreaks(data: PivotedResult[]): LongestStreakResult[] {
  const sorted = [...data].sort((a, b) => a.draw_date.localeCompare(b.draw_date));
  const results: LongestStreakResult[] = [];

  for (const company of COMPANIES) {
    let currentType: 'win' | 'lose' | null = null;
    let currentLength = 0;
    let currentStart: string | null = null;
    let maxWin: LongestStreakResult | null = null;
    let maxLose: LongestStreakResult | null = null;

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

          const streak: LongestStreakResult = {
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

      const finalStreak: LongestStreakResult = {
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

export function average(arr: number[]) {
  return arr.length > 0 ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;
}

export function getAverageStreaks(data: PivotedResult[]): AverageStreakResult[] {
  const sorted = [...data].sort((a, b) => a.draw_date.localeCompare(b.draw_date));
  const results: AverageStreakResult[] = [];

  for (const company of COMPANIES) {
    let currentType: 'win' | 'lose' | null = null;
    let currentLength = 0;

    const winStreaks: number[] = [];
    const loseStreaks: number[] = [];

    for (const row of sorted) {
      const value = row[company];
      if (!value) continue;

      const isWin = hasDuplicateInLastThreeDigits(value);
      const type: 'win' | 'lose' = isWin ? 'win' : 'lose';

      if (type !== currentType) {
        if (currentType === 'win') winStreaks.push(currentLength);
        if (currentType === 'lose') loseStreaks.push(currentLength);
        currentType = type;
        currentLength = 1;
      } else {
        currentLength++;
      }
    }

    // Handle final streak
    if (currentType === 'win') winStreaks.push(currentLength);
    if (currentType === 'lose') loseStreaks.push(currentLength);

    results.push({
      company,
      averageWin: average(winStreaks),
      averageLose: average(loseStreaks),
    });
  }

  return results;
}

export function getBetHitRate(data: PivotedResult[]): Record<string, HitRateResult> {
  const sorted = [...data].sort((a, b) => a.draw_date.localeCompare(b.draw_date));

  const results: Record<string, HitRateResult> = {};

  for (const company of COMPANIES) {
    let loseStreak = 0;
    let totalLoseStreaks = 0;
    let streakCount = 0;
    let lastWasLose = false;

    // First pass: calculate average lose streak
    for (const row of sorted) {
      const val = row[company];
      if (!val) continue;

      const isWin = hasDuplicateInLastThreeDigits(val);

      if (!isWin) {
        loseStreak++;
        lastWasLose = true;
      } else {
        if (lastWasLose && loseStreak > 0) {
          totalLoseStreaks += loseStreak;
          streakCount++;
        }
        loseStreak = 0;
        lastWasLose = false;
      }
    }

    const avgLoseStreak = streakCount > 0 ? Math.round(totalLoseStreaks / streakCount) : 0;

    // Second pass: simulate betting after average lose streak
    let currentLose = 0;
    let canBet = false;
    let bets = 0;
    let hits = 0;

    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];
      const val = row[company];
      if (!val) continue;

      const isWin = hasDuplicateInLastThreeDigits(val);

      if (!isWin) {
        currentLose++;
      } else {
        currentLose = 0;
      }

      if (canBet) {
        bets++;
        if (isWin) hits++;
        canBet = false;
      }

      if (currentLose === avgLoseStreak) {
        canBet = true;
      }
    }

    results[company] = {
      bets,
      hits,
      hitRate: bets > 0 ? +((hits / bets) * 100).toFixed(2) : 0,
    };
  }

  return results;
}

export function getBetResult(
  data: PivotedResult[],
  basePrize: number,
  baseBet: number
): BetResult[] {
  const sorted = [...data].sort((a, b) => a.draw_date.localeCompare(b.draw_date));
  const results: BetResult[] = [];

  for (const company of COMPANIES) {
    let currentBet = baseBet;
    let currentPrize = basePrize;
    let cumulativeLoss = 0;
    let netProfit = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalCost = 0;

    for (const row of sorted) {
      const value = row[company];
      if (!value) continue;

      const isWin = hasDuplicateInLastThreeDigits(value);

      totalCost += currentBet;

      if (isWin) {
        totalWins++;
        netProfit += currentPrize - cumulativeLoss - currentBet;
        cumulativeLoss = 0;
        currentBet = baseBet;
        currentPrize = basePrize;
      } else {
        totalLosses++;
        cumulativeLoss += currentBet;

        let multiplier = 1;
        while (basePrize * multiplier <= cumulativeLoss + baseBet * multiplier) {
          multiplier++;
        }

        currentBet = baseBet * multiplier;
        currentPrize = basePrize * multiplier;
      }
    }

    results.push({
      company: company.charAt(0).toUpperCase() + company.slice(1),
      totalWins,
      totalLosses,
      totalCost,
      netProfit,
    });
  }

  return results;
}
