import { Hono } from 'hono';
import { handle } from 'hono/nextjs';
import { serve as nodeServer } from '@hono/node-server';
export function getRuntime() {
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
        case 'node':
            if (global.process.env.VERCEL === '1') {
                return async (vRequest, vResponse) => {
                    const subApp = new Hono().route(options?.vercel?.path ?? '/api', app);
                    const stdRequest = new Request(`https://${global.process.env.VERCEL_URL}${vRequest.url}`, {
                        method: vRequest.method,
                        body: vRequest.body
                    });
                    Object.keys(vRequest.headers).forEach((name) => {
                        stdRequest.headers.set(name, vRequest.headers[name]);
                    });
                    const honoResponse = await subApp.fetch(stdRequest);
                    honoResponse.headers.forEach((value, name) => {
                        vResponse.setHeader(name, value);
                    });
                    return vResponse
                        .status(honoResponse.status)
                        .send(Buffer.from(await honoResponse.arrayBuffer()));
                };
            }
            return nodeServer(app);
        case 'fastly':
            app.fire();
    }
    return app;
};
