import { PurpleAirAPISensorDef, SensorNames } from './types';

export const KV_SENSOR_HISTORY_KEY = 'sensor-history-data';
export const KV_SENSOR_HISTORY_COUNT = 60 * 24 * 7;
export const sensors: Record<SensorNames, PurpleAirAPISensorDef> = {
  home: {
    id: 132144,
    name: 'home',
    sensor_index: 68841,
  },
  outside1: {
    id: 132147,
    name: 'outside1',
    sensor_index: 159749,
  },
  outside2: {
    id: 132145,
    name: 'outside2',
    sensor_index: 2856,
  },
};
