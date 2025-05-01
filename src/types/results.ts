export type PivotedResult = {
  draw_date: string;
  [company: string]: string | null;
};

export type StreakResult = {
  company: string;
  type: 'win' | 'lose';
  length: number;
  startDate: string;
  endDate: string;
};
