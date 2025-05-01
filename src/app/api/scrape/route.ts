import { BASE_URL_4DKINGDOM, COMPANIES_MAP } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('dateRange');

  if (!range || !range.includes('-')) {
    return NextResponse.json(
      { error: 'Missing or invalid date range. Use format YYYYMMDD-YYYYMMDD or YYYYMMDD-' },
      { status: 400 }
    );
  }

  const [startRaw, endRaw] = range.split('-');
  const startDate = dayjs(startRaw, 'YYYYMMDD');
  const endDate = endRaw ? dayjs(endRaw, 'YYYYMMDD') : dayjs();

  if (!startDate.isValid() || !endDate.isValid()) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYYMMDD.' }, { status: 400 });
  }

  const rowsToInsert = [];

  for (
    let current = startDate;
    current.isBefore(endDate) || current.isSame(endDate, 'day');
    current = current.add(1, 'day')
  ) {
    const date = current.format('YYYY-MM-DD');
    const url = `${BASE_URL_4DKINGDOM}/past-results/${date}`;

    try {
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      const row: Record<string, string | null> = { draw_date: date };

      for (const { name, selector } of COMPANIES_MAP) {
        const box = $(selector);
        const prize = box.find('.num_topprize').first().text().trim();
        row[name] = prize && /^\d+$/.test(prize) ? prize.padStart(4, '0') : null;
      }

      const hasAnyResult = COMPANIES_MAP.some(({ name }) => row[name]);
      if (hasAnyResult) {
        rowsToInsert.push(row);
      } else {
        console.log(`Skipped ${date}: No results found for any company`);
      }
    } catch (err: any) {
      console.warn(`Skipped ${date}: ${err.message}`);
    }
  }

  if (rowsToInsert.length === 0) {
    return NextResponse.json({ success: true, inserted: 0 });
  }

  const { error } = await supabase
    .from('results')
    .upsert(rowsToInsert, { onConflict: 'draw_date' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: rowsToInsert.length });
}
