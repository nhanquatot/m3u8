export const runtime = 'edge';  
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { url, referer, userAgent } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {};
    if (referer) headers['Referer'] = referer;
    if (userAgent) headers['User-Agent'] = userAgent;

    const response = await axios.get(url, { headers });
    const playlistContent = response.data;

    return NextResponse.json({ content: playlistContent });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}
