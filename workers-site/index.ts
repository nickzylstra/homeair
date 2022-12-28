import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
//@ts-ignore
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false;

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  __STATIC_CONTENT: KVNamespace;
  API_CACHE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api')) {
        return await handleAPIRequest(request, env, ctx);
      }
      return await handleAssetRequest(request, env, ctx);
    } catch (e: any) {
      if (DEBUG) {
        return new Response(e.message || e.toString(), {
          status: 500,
        });
      }
      return new Response('Internal Error', { status: 500 });
    }
  },
};

async function handleAPIRequest(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);

  const sensorDataKey = 'sensor-data';

  if (!url.pathname.startsWith(`/api/${sensorDataKey}`))
    return new Response(`No API endpoint found for ${url.pathname}`, {
      status: 404,
    });

  // get data from kv if exists (not expired)
  const sensorData = await env.API_CACHE.get(sensorDataKey);
  if (sensorData !== null) {
    return new Response(sensorData, {
      headers: { 'content-type': 'application/json' },
    });
  }

  console.log(`api kv cache miss for ${sensorDataKey}`);
  // TODO get data from purple air using API key stored as env var
  const purpleAirData = JSON.stringify({ data: 'pa-data' });
  await env.API_CACHE.put(sensorDataKey, purpleAirData, {
    expirationTtl: 60,
  });

  return new Response(purpleAirData, { headers: { 'content-type': 'application/json' } });
}

async function handleAssetRequest(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);
  try {
    return await getAssetFromKV(
      {
        request,
        waitUntil(promise) {
          return ctx.waitUntil(promise);
        },
      },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
        cacheControl: {
          bypassCache: DEBUG,
        },
      },
    );
  } catch (e: any) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(
          {
            request,
            waitUntil(promise) {
              return ctx.waitUntil(promise);
            },
          },
          {
            mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/404.html`, req),
          },
        );

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404,
        });
      } catch (e: any) {}
    }

    return new Response(e.message || e.toString(), { status: 500 });
  }
}
