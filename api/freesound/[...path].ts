export const config = {
	runtime: 'edge',
};

const FREESOUND_BASE_URL = 'https://freesound.org/apiv2';

const buildTargetUrl = (requestUrl: URL) => {
	const downstreamPath = requestUrl.pathname.replace(/^\/api\/freesound/, '') || '/';
	return `${FREESOUND_BASE_URL}${downstreamPath}${requestUrl.search}`;
};

export default async function handler(req: Request) {
	if (req.method !== 'GET') {
		return new Response('Method Not Allowed', { status: 405 });
	}

	const apiKey = process.env.FREESOUND_API_KEY;
	if (!apiKey) {
		return new Response(JSON.stringify({ message: 'FREESOUND_API_KEY is not configured.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const requestUrl = new URL(req.url);
	const targetUrl = buildTargetUrl(requestUrl);
	const startTime = Date.now();
	const { signal } = req as Request & { signal?: AbortSignal };

	try {
		const response = await fetch(targetUrl, {
			headers: {
				Authorization: `Token ${apiKey}`,
			},
			signal,
		});

		const duration = Date.now() - startTime;
		const headers = new Headers();
		const contentType = response.headers.get('content-type');
		if (contentType) {
			headers.set('Content-Type', contentType);
		}

		const logMessage = `[FreeSound Proxy] ${response.status} ${requestUrl.pathname}${requestUrl.search} (${duration}ms)`;
		if (!response.ok) {
			console.warn(logMessage);
		} else {
			console.info(logMessage);
		}

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`[FreeSound Proxy] request failed after ${duration}ms`, error);
		return new Response(JSON.stringify({ message: 'Failed to reach FreeSound API.' }), {
			status: 502,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
