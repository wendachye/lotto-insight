export type FlatResult = {
    draw_date: string;
    company: string;
    result_no: number;
};

export type PivotedResult = {
    draw_date: string;
    [company: string]: string | number | null;
};