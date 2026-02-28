import { NextResponse } from 'next/server';

const MODELS = [
    'gemini-2.0-flash',      // Primary
    'gemini-flash-latest',   // Alias for latest stable flash (likely 1.5)
    'gemini-pro-latest',     // Alias for latest stable pro
    'gemini-2.0-flash-lite', // Lightweight 2.0 model
];


async function tryFetchGemini(apiKey: string, body: any, model: string) {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );
        return res;
    } catch (error) {
        console.error(`Error fetching Gemini model ${model}:`, error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing server GOOGLE_API_KEY environment variable.' }, { status: 500 });
        }

        const body = await request.json();

        // Implement model rotation to handle rate limits (429)
        for (let i = 0; i < MODELS.length; i++) {
            const model = MODELS[i];
            const res = await tryFetchGemini(apiKey, body, model);

            if (!res) continue;

            if (res.status === 429) {
                console.warn(`Gemini model ${model} rate limited (429). Trying next model...`);
                // Wait a bit before trying the next model to let the quota refresh slightly
                if (i < MODELS.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                continue;
            }

            const data = await res.json();

            // Handle cases where the API returns 200 but has an error in the body
            if (data.error) {
                console.error(`Gemini API error for model ${model}:`, data.error);
                continue;
            }

            return NextResponse.json(data, { status: res.status });
        }

        // If all models failed or were rate limited
        return NextResponse.json({
            error: 'AI services are currently reaching their capacity limits. Please try again in 30 seconds.',
            status: 429
        }, { status: 429 });

    } catch (err) {
        console.error("Gemini Route Error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
