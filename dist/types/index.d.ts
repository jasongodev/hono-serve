/// <reference types="node" />
import { Hono, Env } from 'hono';
import type { Server as nodeServerType } from 'node:http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
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
export type HonoLagonReturn = (req: Request) => Response | Promise<Response>;
export type HonoNextjsReturn = (req: Request) => Response | Promise<Response>;
export type HonoNodeReturn = nodeServerType | Promise<nodeServerType>;
export type HonoVercelNodeReturn = (req: VercelRequest, res: VercelResponse) => VercelResponse | Promise<VercelResponse>;
export type HonoServe = HonoBunReturn | HonoCloudflareReturn | HonoFastlyReturn | HonoLagonReturn | HonoNextjsReturn | HonoNodeReturn | HonoVercelNodeReturn;
export declare const serve: <E extends Env>(app: Hono<E, {}, "">, options?: HonoServeOptions) => HonoServe;
