// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartDataPoint } from './types';

function averageArr(arr: number[]): number | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  return Math.round(arr.reduce((a, b) => a + b) / arr.length);
}

function averageData(data: ChartDataPoint[]): ChartDataPoint[] {
  const averageChartDataMinutes = 15;
  const averagedData: ChartDataPoint[] = [];

  let tempPoints: ChartDataPoint[] = [];
  data.forEach((p, i) => {
    tempPoints.push(p);

    if ((i + 1) % averageChartDataMinutes === 0 || i === data.length - 1) {
      const atp = tempPoints[tempPoints.length - 1];
      const intervalPoints: Partial<Record<keyof ChartDataPoint, number[]>> = {
        ourHouseTempF: [],
        ourHouseRelHumidityPerc: [],
        ourHouseAQI: [],
        outside1AQI: [],
        outside2AQI: [],
        outsideAvgAQI: [],
      };
      tempPoints.forEach((tp) => {
        Object.entries(tp).forEach(([k, v]) => {
          if (typeof v === 'number' && v !== undefined) {
            intervalPoints[k as keyof ChartDataPoint]?.push(v);
          }
        });
      });

      atp.ourHouseTempF = averageArr(intervalPoints.ourHouseTempF ?? []);
      atp.ourHouseRelHumidityPerc = averageArr(intervalPoints.ourHouseRelHumidityPerc ?? []);
      atp.ourHouseAQI = averageArr(intervalPoints.ourHouseAQI ?? []);
      atp.outside1AQI = averageArr(intervalPoints.outside1AQI ?? []);
      atp.outside2AQI = averageArr(intervalPoints.outside2AQI ?? []);
      atp.outsideAvgAQI = averageArr(intervalPoints.outsideAvgAQI ?? []);

      averagedData.push(atp);
      tempPoints = [];
    }
  });

  return averagedData;
}

function Chart({ data }: { data: ChartDataPoint[] }) {
  const averagedData = averageData(data);
  return (
    <ResponsiveContainer width="95%" height={600}>
      <LineChart data={averagedData}>
        <Line type="monotone" dataKey="ourHouseAQI" stroke="#8884d8" />
        <Line type="monotone" dataKey="outsideAvgAQI" stroke="#1884d8" />
        <Line type="monotone" dataKey="ourHouseTempF" stroke="#50C878" />
        <Line type="monotone" dataKey="ourHouseRelHumidityPerc" stroke="#ffcc00" />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis
          dataKey="tsLocal"
          angle={-45}
          tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
        />
        <YAxis />
        <Legend verticalAlign="top" />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default Chart;
