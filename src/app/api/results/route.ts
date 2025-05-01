import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';

export async function fetchAllResults(batchSize = 1000) {
  const allResults: any[] = [];
  let page = 0;

  while (true) {
    const from = page * batchSize;
    const to = from + batchSize - 1;

    const { data, error } = await supabase
      .from('results')
      .select('*')
      .range(from, to)
      .order('draw_date', { ascending: true });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;

    allResults.push(...data);

    if (data.length < batchSize) break;

    page++;
  }

  return allResults;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const date = searchParams.get('date');
  const sort = searchParams.get('sort') === 'asc' ? 'asc' : 'desc';
  const size = parseInt(searchParams.get('size') || '150');

  if (date && !dayjs(date, 'YYYY-MM-DD', true).isValid()) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  if (size === 0) {
    const data = await fetchAllResults();
    return NextResponse.json({
      results: data,
      hasNextPage: false,
      oldestDate: null,
      latestDate: null,
    });
  }

  const refDate = dayjs(date);
  const fromDate =
    sort === 'desc'
      ? refDate.subtract(size, 'day').format('YYYY-MM-DD')
      : refDate.format('YYYY-MM-DD');
  const toDate =
    sort === 'desc' ? refDate.format('YYYY-MM-DD') : refDate.add(size, 'day').format('YYYY-MM-DD');

  const { data: results, error } = await supabase
    .from('results')
    .select('draw_date, magnum, toto, damacai, sandakan, sabah, sarawak, singapore')
    .gte('draw_date', fromDate)
    .lte('draw_date', toDate)
    .order('draw_date', { ascending: sort === 'asc' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const edgeDate =
    sort === 'desc'
      ? dayjs(fromDate).subtract(1, 'day').format('YYYY-MM-DD')
      : dayjs(toDate).add(1, 'day').format('YYYY-MM-DD');

  let edgeQuery = supabase.from('results').select('id').limit(1);
  if (sort === 'asc') {
    edgeQuery = edgeQuery.gte('draw_date', edgeDate);
  } else {
    edgeQuery = edgeQuery.lte('draw_date', edgeDate);
  }

  const { data: nextRow, error: nextError } = await edgeQuery;
  if (nextError) {
    return NextResponse.json({ error: nextError.message }, { status: 500 });
  }

  const hasNextPage = nextRow.length > 0;

  const [{ data: oldestRow }, { data: latestRow }] = await Promise.all([
    supabase
      .from('results')
      .select('draw_date')
      .order('draw_date', { ascending: true })
      .limit(1)
      .single(),
    supabase
      .from('results')
      .select('draw_date')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single(),
  ]);

  return NextResponse.json({
    results,
    hasNextPage,
    oldestDate: oldestRow?.draw_date ?? null,
    latestDate: latestRow?.draw_date ?? null,
  });
}
