import { BASE_URL_4DKINGDOM } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';

const companiesMap = [
  { name: 'magnum', selector: '.resultbox.bg_magnum' },
  { name: 'toto', selector: '.resultbox.bg_toto' },
  { name: 'damacai', selector: '.resultbox.bg_damacai' },
  { name: 'sandakan', selector: '.resultbox.bg_stc' },
  { name: 'sabah', selector: '.resultbox.bg_sabah' },
  { name: 'sarawak', selector: '.resultbox.bg_stec' },
  { name: 'singapore', selector: '.resultbox.bg_sg4d' },
];

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

  const results = [];

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

      for (const { name, selector } of companiesMap) {
        const box = $(selector);
        if (box.length === 0) continue;

        const firstPrize = box.find('.num_topprize').first().text().trim();
        const number = parseInt(firstPrize);

        if (!isNaN(number)) {
          results.push({
            draw_date: date,
            company: name,
            result_no: firstPrize,
          });
        }
      }
    } catch (err: any) {
      console.warn(`Skipped ${date}: ${err.message}`);
    }
  }

  if (results.length === 0) {
    return NextResponse.json({
      success: true,
      inserted: 0,
    });
  }

  const { error } = await supabase
    .from('results')
    .upsert(results, { onConflict: 'draw_date,company' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: results.length });
}
