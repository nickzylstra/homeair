import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { createUIDataPoint, UIDPToStorage, processPurpleAirAPIDataPoint } from '../src/utils';
import { UIDataPointStored } from '../src/types';
import { sensors, KV_SENSOR_HISTORY_KEY, KV_SENSOR_HISTORY_COUNT } from '../src/config';
//@ts-ignore
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
import { PurpleAirGroupMembersData } from '../src/types';
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
  API_DATA: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;

  PURPLE_AIR_API_READ_KEY: string;
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
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleCronTrigger(controller, env, ctx));
  },
};

async function handleAPIRequest(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);

  if (!url.pathname.startsWith(`/api/${KV_SENSOR_HISTORY_KEY}`))
    return new Response(`No API endpoint found for ${url.pathname}`, {
      status: 404,
    });

  const sensorData = await env.API_DATA.get(KV_SENSOR_HISTORY_KEY);
  if (sensorData === null) {
    return new Response('no data found', { status: 404 });
  }

  return new Response(sensorData, {
    headers: { 'content-type': 'application/json' },
  });
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

// https://api.purpleair.com/#api-groups-get-members-data
// GET https://api.purpleair.com/v1/groups/1536/members?fields=pm2.5%2Ctemperature%2Chumidity%2Cpressure%2Clast_seen
// X-API-Key: <read-key>
const purpleAirExampleResponse =
  '"{"api_version":"V1.0.11-0.0.42","time_stamp":1672286482,"data_time_stamp":1672286460,"group_id":1536,"max_age":604800,"firmware_default_version":"7.02","fields":["sensor_index","last_seen","humidity","temperature","pressure","pm2.5"],"data":[[2856,1672286435,58,57,1008.46,10.0],[159749,1672286459,50,59,1011.67,8.5],[68841,1672286369,31,82,1009.9,11.2],[111974,1672286360,60,56,1012.05,7.0]]}"';

async function handleCronTrigger(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
  // get current sensor data
  const purpleAirRes = await fetch(
    'https://api.purpleair.com/v1/groups/1536/members?fields=pm2.5%2Ctemperature%2Chumidity%2Cpressure%2Clast_seen',
    {
      headers: {
        'X-API-Key': env.PURPLE_AIR_API_READ_KEY,
      },
    },
  );
  const purpleAirData = await purpleAirRes.json<PurpleAirGroupMembersData>();

  // process current sensor data
  const sensorHomeDataPoint = processPurpleAirAPIDataPoint(
    purpleAirData,
    sensors.home.sensor_index,
  );
  const sensorNeighbor1DataPoint = processPurpleAirAPIDataPoint(
    purpleAirData,
    sensors.outside1.sensor_index,
  );
  const sensorNeighbor2DataPoint = processPurpleAirAPIDataPoint(
    purpleAirData,
    sensors.outside2.sensor_index,
  );
  const UIDataPoint = createUIDataPoint(
    sensorHomeDataPoint,
    sensorNeighbor1DataPoint,
    sensorNeighbor2DataPoint,
  );
  console.log(JSON.stringify(UIDataPoint, null, 2));

  // store current data in dedicated KV key, expiring in 1 hour
  const storedUIDataPoint = UIDPToStorage(UIDataPoint);
  await env.API_DATA.put(`point--${UIDataPoint.tsUTC}`, JSON.stringify(storedUIDataPoint), {
    expirationTtl: 60 * 60,
  });

  // get history data
  let history: UIDataPointStored[];
  const historyString = await env.API_DATA.get(KV_SENSOR_HISTORY_KEY);
  if (historyString === null) {
    console.error('history missing, starting from scratch');
    history = [];
  } else {
    history = JSON.parse(historyString);
  }

  // update history to remove oldest point, and add current
  history.push(storedUIDataPoint);
  if (history.length > KV_SENSOR_HISTORY_COUNT) {
    history.shift();
  }

  // store history data
  await env.API_DATA.put(KV_SENSOR_HISTORY_KEY, JSON.stringify(history));
}
