import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
