export interface ThingsSpeakEndpoint {
  name: string;
  url: string;
  apiKey: string;
}

export interface ThingSpeakData {
  channel: Record<string, string>;
  feeds: Record<string, string>[];
}

export enum APIPoints {
  TEMP_F = 'Temperature',
  REL_HUMIDITY = 'Humidity',
  // Docs say firmware is incorrectly labeled with ATM and 1 swapped.
  // 1 is supposed to be inside and ATM outside
  // https://www2.purpleair.com/community/faq#hc-what-is-the-difference-between-cf-1-and-cf-atm
  PM25 = 'PM2.5 (ATM)',
}

export type ApiPointsToFeed = Record<APIPoints, string>;

export interface ProcessedPoint {
  tempF: number;
  relHumidityPerc: number;
  AQI: number;
  tsUTC: string;
}

export type DataSet = {
  ourHouse: ProcessedPoint[];
  neighbor1: ProcessedPoint[];
  neighbor2: ProcessedPoint[];
};

export interface DataPoint {
  tsLocal: string;
  tsSortable: number;
  ourHouseTempF?: number;
  ourHouseRelHumidityPerc?: number;
  ourHouseAQI?: number;
  outside1AQI?: number;
  outside2AQI?: number;
  outsideAvgAQI?: number;
}

export type PurpleAirAPISensorDef = {
  id: number;
  name: string;
  sensor_index: number;
};

export type PurpleAirGroupMembersData = {
  fields: string[];
  data: number[][];
};

export enum PurpleAirAPIPoints {
  SENSOR_IDX = 'sensor_index',
  UNIX_TS = 'last_seen',
  TEMP_F = 'temperature',
  REL_HUMIDITY = 'humidity',
  PM25 = 'pm2.5',
  PRESSURE = 'pressure',
}

export type PurpleAirAPIFieldsToData = Record<PurpleAirAPIPoints, number>;

export type ProcessedPurpleAirPoint = {
  sensorIndex: number;
  tempF: number;
  relHumidityPerc: number;
  AQI: number;
  tsUnixUTC: number;
};

export type UIDataPoint = {
  tsUTC: string;
  tsSortable: number;
  ourHouseTempF?: number;
  ourHouseRelHumidityPerc?: number;
  ourHouseAQI?: number;
  outside1AQI?: number;
  outside2AQI?: number;
  outsideAvgAQI?: number;
};
