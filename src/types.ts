export type SensorNames = 'home' | 'outside1' | 'outside2';

export type PurpleAirAPISensorDef = {
  id: number;
  name: SensorNames;
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

export type UIDataPointStored = [
  UIDataPoint['tsSortable'],
  Required<UIDataPoint>['ourHouseTempF'] | null,
  Required<UIDataPoint>['ourHouseRelHumidityPerc'] | null,
  Required<UIDataPoint>['ourHouseAQI'] | null,
  Required<UIDataPoint>['outside1AQI'] | null,
  Required<UIDataPoint>['outside2AQI'] | null,
  Required<UIDataPoint>['outsideAvgAQI'] | null,
];

export interface ChartDataPoint extends UIDataPoint {
  tsLocal: string;
}
