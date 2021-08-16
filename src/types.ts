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
  ourHouse: ProcessedPoint[],
  neighbor1: ProcessedPoint[],
  neighbor2: ProcessedPoint[],
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
