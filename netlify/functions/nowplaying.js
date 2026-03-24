exports.handler = async (event) => {
    const streamUrl = event.queryStringParameters?.url;
    if (!streamUrl) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing url' }) };
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(streamUrl, {
            headers: { 'Icy-MetaData': '1', 'Range': 'bytes=0-' },
            signal: controller.signal
        });

        clearTimeout(timeout);

        const metaint = parseInt(response.headers.get('icy-metaint') || '0');
        if (!metaint) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: null })
            };
        }

        const reader = response.body.getReader();
        const chunks = [];
        let bytesRead = 0;
        const needed = metaint + 300;

        while (bytesRead < needed) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            bytesRead += value.length;
        }
        reader.cancel();

        const buffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
        if (buffer.length <= metaint) {
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: null }) };
        }

        const metaLengthByte = buffer[metaint];
        const metaLength = metaLengthByte * 16;
        if (metaLength === 0) {
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: null }) };
        }

        const metaBlock = buffer.slice(metaint + 1, metaint + 1 + metaLength);
        const metaString = metaBlock.toString('utf8').replace(/\0/g, '');
        const match = metaString.match(/StreamTitle='([^']*)'/);
        const title = match ? match[1].trim() : null;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title || null })
        };
    } catch (e) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: null, error: e.message })
        };
    }
};
