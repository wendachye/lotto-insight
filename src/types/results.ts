export type PivotedResult = {
  draw_date: string;
  [company: string]: string | number | null;
};
