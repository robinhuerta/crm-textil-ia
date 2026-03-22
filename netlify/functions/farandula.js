const NEWS_API_KEY = 'cb5c15cab8694cebacc0a8834c17ed7b';

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    try {
        const url = `https://newsapi.org/v2/everything?q=farándula+OR+espectáculos+OR+chisme+celebridades&language=es&sortBy=publishedAt&pageSize=6&apiKey=${NEWS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== 'ok' || !data.articles?.length) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articles: [] })
            };
        }

        const articles = data.articles
            .filter(a => a.title && a.title !== '[Removed]')
            .slice(0, 4)
            .map(a => ({
                title: a.title,
                description: a.description || '',
                source: a.source?.name || ''
            }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articles })
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message })
        };
    }
};
