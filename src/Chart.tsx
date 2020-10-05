// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { ProcessedPoint } from './types';

export type ChartProps = { data: ProcessedPoint[] };
function Chart({ data }: ChartProps) {
  const formattedChartData = data.map((p) => {
    const pDate = new Date(p.tsUTC);
    return {
      ...p,
      tsLocal: pDate.toLocaleString(),
    };
  });
  return (
    <>
      <LineChart width={600} height={600} data={formattedChartData}>
        <Line type="monotone" dataKey="AQI" stroke="#8884d8" />
        <Line type="monotone" dataKey="tempF" stroke="#ccffcc" />
        <Line type="monotone" dataKey="relHumidityPerc" stroke="#ffcc00" />
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
    </>
  );
}

export default Chart;
