export type PivotedResult = {
  draw_date: string;
  [company: string]: string | null;
};

export type LongestStreakResult = {
  company: string;
  type: 'win' | 'lose';
  length: number;
  startDate: string;
  endDate: string;
};

export type AverageStreakResult = {
  company: string;
  averageWin: number;
  averageLose: number;
};

export interface HitRateResult {
  bets: number;
  hits: number;
  hitRate: number;
}

export type BetResult = {
  company: string;
  totalWins: number;
  totalLosses: number;
  totalCost: number;
  netProfit: number;
};
