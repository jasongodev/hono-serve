import { Hono, Env } from 'hono'
import { handle } from 'hono/nextjs'
import { serve as nodeServer } from '@hono/node-server'
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

export type HonoNextjsReturn = (req: Request) => Response | Promise<Response>

export type HonoNodeReturn = nodeServerType

export type HonoVercelNodeReturn = (req: VercelRequest, res: VercelResponse) => VercelResponse | Promise<VercelResponse>

export type HonoServe = HonoBunReturn | HonoCloudflareReturn | HonoFastlyReturn | HonoNextjsReturn | HonoNodeReturn | HonoVercelNodeReturn

export const serve = <E extends Env>(app: Hono<E>, options?: HonoServeOptions): HonoServe => {
  const runtime = getRuntime()
  if (runtime === 'workerd') return app
  switch (runtime) {
    case 'bun':
      return {
        port: options?.bun?.port ?? 3000,
        fetch: app.fetch
      }
    case 'edge-light':
      return handle(app, options?.nextjs?.path ?? '/api')
    case 'node':
      if (global.process.env.VERCEL === '1') {
        return async (vRequest: VercelRequest, vResponse: VercelResponse): Promise<VercelResponse> => {
          const subApp = new Hono().route(options?.vercel?.path ?? '/api', app)

          const trueURL = global.process.env.VERCEL_ENV === 'development' ? `https://${global.process.env.VERCEL_URL as string}${vRequest.url as string}` : vRequest.url as string

          // Transform vRequest into stdRequest which is compatible with Hono's fetch
          const stdRequest = new Request(trueURL, {
            method: vRequest.method as string,
            body: vRequest.body
          })

          // Copy vRequest's headers into stdRequest
          Object.keys(vRequest.headers).forEach((name: string) => {
            stdRequest.headers.set(name, vRequest.headers[name] as string)
          })

          // Process stdRequest using Hono
          const honoResponse = await subApp.fetch(stdRequest)

          // Copy honoResponse into vResponse
          honoResponse.headers.forEach((value: string, name: string) => {
            vResponse.setHeader(name, value)
          })

          return vResponse
            .status(honoResponse.status)
            .send(Buffer.from(await honoResponse.arrayBuffer()))
        }
      }
      return nodeServer(app)
    case 'fastly':
      app.fire()
  }
  return app
}
