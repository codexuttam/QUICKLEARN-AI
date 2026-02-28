import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const maxResults = searchParams.get('maxResults') || '4';

        const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing server YOUTUBE_API_KEY environment variable.' }, { status: 500 });
        }

        // 1) Search for videos
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${apiKey}&q=${encodeURIComponent(
            q,
        )}&maxResults=${encodeURIComponent(maxResults)}`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchRes.ok) {
            // Log details for debugging (do not log the API key)
            console.error('YouTube search failed', { status: searchRes.status, body: searchData?.error ?? searchData });
            // forward status and body for client debugging
            return NextResponse.json(searchData, { status: searchRes.status });
        }

        // 2) Fetch statistics for found videos (if any)
        const items = searchData.items || [];
        if (items.length === 0) return NextResponse.json(searchData, { status: 200 });

        const videoIds = items.map((it: any) => it.id?.videoId).filter(Boolean).join(',');
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&key=${apiKey}&id=${encodeURIComponent(videoIds)}`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        if (!statsRes.ok) {
            console.error('YouTube stats fetch failed', { status: statsRes.status, body: statsData?.error ?? statsData });
            // Return search results but include stats error information
            return NextResponse.json({ search: searchData, statsError: statsData }, { status: statsRes.status });
        }

        return NextResponse.json({ search: searchData, stats: statsData }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
