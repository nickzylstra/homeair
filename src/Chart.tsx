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

function Chart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="95%" height={600}>
      <LineChart data={data}>
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
