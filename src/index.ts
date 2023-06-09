import { Hono, Env } from 'hono'
import { handle } from 'hono/nextjs'
import type { Server as nodeServerType } from 'node:http'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export function getRuntime (): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const global = globalThis as any

  if (global?.Deno !== undefined) {
    return 'deno'
  }

  if (global?.Bun !== undefined) {
    return 'bun'
  }

  if (typeof global?.WebSocketPair === 'function') {
    return 'workerd'
  }

  if (typeof global?.EdgeRuntime === 'string') {
    return 'edge-light'
  }

  let onFastly = false
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { env } = require('fastly:env')
    if (env instanceof Function) onFastly = true
  } catch {}
  if (onFastly) {
    return 'fastly'
  }

  if (global?.__lagon__ !== undefined) {
    return 'lagon'
  }

  if (global?.process?.release?.name === 'node') {
    return 'node'
  }

  return 'other'
}

export interface HonoServeOptions {
  bun?: {
    port?: number
  }
  deno?: {}
  nextjs?: {
    path?: string
  }
  vercel?: {
    path?: string
  }
}

export interface HonoBunReturn {
  port?: number
  fetch: Function
}

export type HonoCloudflareReturn = Hono

export type HonoFastlyReturn = Hono

export type HonoLagonReturn = (req: Request) => Response | Promise<Response>

export type HonoNextjsReturn = (req: Request) => Response | Promise<Response>

export type HonoNodeReturn = nodeServerType | Promise<nodeServerType>

export type HonoVercelNodeReturn = (req: VercelRequest, res: VercelResponse) => VercelResponse | Promise<VercelResponse>

export type HonoServe = HonoBunReturn | HonoCloudflareReturn | HonoFastlyReturn | HonoLagonReturn | HonoNextjsReturn | HonoNodeReturn | HonoVercelNodeReturn

export const serve = <E extends Env>(app: Hono<E>, options?: HonoServeOptions): HonoServe => {
  switch (getRuntime()) {
    case 'node':
      if (global.process.env.VERCEL === '1') {
        return async (vRequest: VercelRequest, vResponse: VercelResponse): Promise<VercelResponse> => {
          // Transform vRequest into stdRequest which is compatible with Hono's fetch
          const stdRequest = new Request(`https://${global.process.env.VERCEL_URL as string}${vRequest.url as string}`, {
            method: vRequest.method as string,
            body: vRequest.body
          })

          // Copy vRequest's headers into stdRequest
          Object.keys(vRequest.headers).forEach((name: string) => {
            stdRequest.headers.set(name, vRequest.headers[name] as string)
          })

          // Process stdRequest using Hono
          const honoResponse = await app.basePath(options?.vercel?.path ?? '/api').fetch(stdRequest)

          // Copy honoResponse into vResponse
          honoResponse.headers.forEach((value: string, name: string) => {
            vResponse.setHeader(name, value)
          })

          return vResponse
            .status(honoResponse.status)
            .send(Buffer.from(await honoResponse.arrayBuffer()))
        }
      } else {
        return import('@hono/node-server').then(({ serve }) => serve(app))
      }
    case 'bun':
      return {
        port: options?.bun?.port ?? 3000,
        fetch: app.fetch
      }
    case 'edge-light':
      return handle(app.basePath(options?.nextjs?.path ?? '/api'))
    case 'lagon':
      return app.fetch
    case 'fastly':
      app.fire()
  }
  return app
}
