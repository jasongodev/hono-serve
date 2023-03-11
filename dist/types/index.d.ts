import { Hono, Env } from 'hono';
export declare function getRuntime(): string;
export interface HonoServeOptions {
    bun?: {
        port?: number;
    };
    deno?: {};
    nextjs?: {
        path?: string;
    };
    vercel?: {
        path?: string;
    };
}
export interface HonoBunReturn {
    port?: number;
    fetch: Function;
}
export type HonoCloudflareReturn = Hono;
export type HonoFastlyReturn = Hono;
export type HonoNextjsReturn = (req: Request) => Response | Promise<Response>;
export type HonoVercelReturn = (req: Request, res: Response) => Response | Promise<Response>;
export type HonoServe = HonoBunReturn | HonoCloudflareReturn | HonoFastlyReturn | HonoNextjsReturn | HonoVercelReturn | Hono;
export declare const serve: <E extends Env>(app: Hono<E, {}, "">, options?: HonoServeOptions) => HonoServe;
