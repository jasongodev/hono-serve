import { Hono } from 'hono';
import { handle } from 'hono/nextjs';
export function getRuntime() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const global = globalThis;
    if (global?.Deno !== undefined) {
        return 'deno';
    }
    if (global?.Bun !== undefined) {
        return 'bun';
    }
    if (typeof global?.WebSocketPair === 'function') {
        return 'workerd';
    }
    if (typeof global?.EdgeRuntime === 'string') {
        return 'edge-light';
    }
    let onFastly = false;
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { env } = require('fastly:env');
        if (env instanceof Function)
            onFastly = true;
    }
    catch { }
    if (onFastly) {
        return 'fastly';
    }
    if (global?.__lagon__ !== undefined) {
        return 'lagon';
    }
    if (global?.process?.release?.name === 'node') {
        return 'node';
    }
    return 'other';
}
export const serve = (app, options) => {
    const runtime = getRuntime();
    if (runtime === 'workerd')
        return app;
    switch (runtime) {
        case 'bun':
            return {
                port: options?.bun?.port ?? 3000,
                fetch: app.fetch
            };
        case 'edge-light':
            return handle(app, options?.nextjs?.path ?? '/api');
        case 'vercel':
            return async (req, res) => {
                const subApp = new Hono().route(options?.vercel?.path ?? '/api', app);
                return await subApp.fetch(req);
            };
        case 'fastly':
            app.fire();
    }
    return app;
};
