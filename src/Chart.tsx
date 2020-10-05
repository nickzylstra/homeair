// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { LineChart, Line } from 'recharts';
import { ProcessedPoint } from './types';

export type ChartProps = { data: ProcessedPoint[] };
function Chart({ data }: ChartProps) {
  return (
    <>
      <LineChart width={400} height={400} data={data}>
        <Line type="monotone" dataKey="AQI" stroke="#8884d8" />
      </LineChart>
    </>
  );
}

export default Chart;
