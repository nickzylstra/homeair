import {
  PurpleAirGroupMembersData,
  PurpleAirAPIFieldsToData as PurpleAirAPIFieldsToDataIdx,
  PurpleAirAPIPoints,
  UIDataPoint,
  UIDataPointStored,
  ProcessedPurpleAirPoint,
} from './types';
import { sensors } from './config';

// USA EPA AQI Conversion for recommended for wildfire smoke
// https://www.purpleair.com/map?opt=1/i/mAQI/a10/cC5#11.25/37.8076/-122.3897
// 0-250 ug/m3 range (>250 may underestimate true PM2.5):
// PM2.5 (µg/m³) = 0.534 x PA(cf_1) - 0.0844 x RH + 5.604
function PurpleAirPM25toUSEPAPM25(PM25: number, RH: number) {
  return 0.534 * PM25 - 0.0844 * RH + 5.604;
}

// https://cfpub.epa.gov/airnow/index.cfm?action=airnow.calculator
function PM25toAQI(PM25: number) {
  function Linear(
    AQIhigh: number,
    AQIlow: number,
    Conchigh: number,
    Conclow: number,
    Concentration: number,
  ) {
    // from PA API docs: https://docs.google.com/document/d/15ijz94dXJ-YAZLi9iZ_RaBwrZ4KtYeCy08goGBwnbCU/edit
    const AQI = ((Concentration - Conclow) / (Conchigh - Conclow)) * (AQIhigh - AQIlow) + AQIlow;
    return Math.round(AQI);
  }

  const c = Math.floor(10 * PM25) / 10;
  // The PA sensors may report a slightly negative number when it's raining
  if (c < -1) {
    throw new Error(`unexpected PM25 value of ${c}`);
  }
  if (c >= -1 && c < 0) {
    return 0;
  }
  if (c >= 0 && c < 12.1) {
    return Linear(50, 0, 12, 0, c);
  }
  if (c >= 12.1 && c < 35.5) {
    return Linear(100, 51, 35.4, 12.1, c);
  }
  if (c >= 35.5 && c < 55.5) {
    return Linear(150, 101, 55.4, 35.5, c);
  }
  if (c >= 55.5 && c < 150.5) {
    return Linear(200, 151, 150.4, 55.5, c);
  }
  if (c >= 150.5 && c < 250.5) {
    return Linear(300, 201, 250.4, 150.5, c);
  }
  if (c >= 250.5 && c < 350.5) {
    return Linear(400, 301, 350.4, 250.5, c);
  }
  if (c >= 350.5 && c < 500.5) {
    return Linear(500, 401, 500.4, 350.5, c);
  }
  return NaN;
}

// eslint-disable-next-line import/prefer-default-export
export function convertPM25toAQI(PM25: number, RH: number) {
  return PM25toAQI(PurpleAirPM25toUSEPAPM25(PM25, RH));
}

// https://api.purpleair.com/#api-sensors-get-sensor-data
export function correctInsideTemp(tempF: number) {
  return Math.round(10 * (tempF - 11)) / 10;
}
export function correctOutsideTemp(tempF: number) {
  return Math.round(10 * (tempF - 8)) / 10;
}
export function correctTemp(tempF: number, sensorIndex: number) {
  if (sensorIndex === sensors.home.sensor_index) {
    return correctInsideTemp(tempF);
  }
  return correctOutsideTemp(tempF);
}
// https://api.purpleair.com/#api-sensors-get-sensor-data
export function correctHumidity(h: number) {
  return Math.round(10 * (h + 4)) / 10;
}

export function processPurpleAirAPIDataPoint(
  purpleAirData: PurpleAirGroupMembersData,
  sensorIdx: number,
): ProcessedPurpleAirPoint {
  const { fields, data } = purpleAirData;

  const apiPointsToFeed = fields.reduce<PurpleAirAPIFieldsToDataIdx>((map, key, idx) => {
    const updatedMap = { ...map };
    Object.entries(PurpleAirAPIPoints).forEach(([_, point]) => {
      if (point === key) {
        updatedMap[point] = idx;
      }
    });
    return updatedMap;
  }, {} as PurpleAirAPIFieldsToDataIdx);

  const apiDataSensorIdx = data.findIndex(
    (d) => d[apiPointsToFeed[PurpleAirAPIPoints.SENSOR_IDX]] === sensorIdx,
  );

  const point = data[apiDataSensorIdx];
  const RH = correctHumidity(point[apiPointsToFeed[PurpleAirAPIPoints.REL_HUMIDITY]]);
  const rawPM25 = point[apiPointsToFeed[PurpleAirAPIPoints.PM25]];

  return {
    sensorIndex: sensorIdx,
    tsUnixUTC: point[apiPointsToFeed[PurpleAirAPIPoints.UNIX_TS]],
    tempF: correctTemp(point[apiPointsToFeed[PurpleAirAPIPoints.TEMP_F]], sensorIdx),
    relHumidityPerc: RH,
    AQI: convertPM25toAQI(rawPM25, RH),
  };
}

export function genHumanUTCString(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

export function createUIDataPoint(
  home: ProcessedPurpleAirPoint,
  out1: ProcessedPurpleAirPoint,
  out2: ProcessedPurpleAirPoint,
): UIDataPoint {
  const tsNowUTC = Math.floor(Date.now() / 1000);
  const dp: UIDataPoint = {
    tsUTC: genHumanUTCString(tsNowUTC),
    tsSortable: tsNowUTC,
  };

  // sensors are supposed report in to PurpleAir servers every 2 minutes
  const tsCutoffSeconds = 60 * 3;

  const isHomeValid = tsNowUTC - home.tsUnixUTC < tsCutoffSeconds;
  if (isHomeValid) {
    dp.ourHouseAQI = home.AQI;
    dp.ourHouseRelHumidityPerc = home.relHumidityPerc;
    dp.ourHouseTempF = home.tempF;
  }

  const isOut1Valid = tsNowUTC - out1.tsUnixUTC < tsCutoffSeconds;
  if (isOut1Valid) {
    dp.outside1AQI = out1.AQI;
    dp.outsideAvgAQI = out1.AQI;
    dp.outsideAvgTempF = out1.tempF;
  }

  const isOut2Valid = tsNowUTC - out2.tsUnixUTC < tsCutoffSeconds;
  if (isOut2Valid) {
    dp.outside2AQI = out2.AQI;
    dp.outsideAvgAQI = out2.AQI;
    dp.outsideAvgTempF = out2.tempF;
  }

  if (isOut1Valid && isOut2Valid) {
    dp.outsideAvgAQI = (out1.AQI + out2.AQI) / 2;
    dp.outsideAvgTempF = Math.round((out1.tempF + out2.tempF) / 2);
  }

  return dp;
}

export function UIDPToStorage(p: UIDataPoint): UIDataPointStored {
  return [
    p.tsSortable,
    p.ourHouseTempF ?? null,
    p.ourHouseRelHumidityPerc ?? null,
    p.ourHouseAQI ?? null,
    p.outside1AQI ?? null,
    p.outside2AQI ?? null,
    p.outsideAvgAQI ?? null,
    p.outsideAvgTempF ?? null,
  ];
}

export function UIDPFromStorage(p: UIDataPointStored): UIDataPoint {
  return {
    tsUTC: genHumanUTCString(p[0]),
    tsSortable: p[0],
    ourHouseTempF: p[1] ?? undefined,
    ourHouseRelHumidityPerc: p[2] ?? undefined,
    ourHouseAQI: p[3] ?? undefined,
    outside1AQI: p[4] ?? undefined,
    outside2AQI: p[5] ?? undefined,
    outsideAvgAQI: p[6] ?? undefined,
    outsideAvgTempF: p[7] ?? undefined,
  };
}
