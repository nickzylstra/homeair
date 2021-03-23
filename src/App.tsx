// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useState, useEffect } from 'react';
import querystring from 'querystring';
import './App.css';
import {
  ThingSpeakJSON, APIPoints, ApiPointsToFeed, ProcessedPoint,
} from './types';
import CurrentStatus from './CurrentStatus';
import Chart from './Chart';
import { convertPM25toAQI, correctTemp, getAPIStart } from './utils';

const ThingSpeakUrl = 'https://api.thingspeak.com/channels/1146562/feeds.json';
const APIResponseExample = JSON.parse('{"channel":{"id":1146562,"name":"AirMonitor_965","latitude":"0.0","longitude":"0.0","field1":"PM1.0 (ATM)","field2":"PM2.5 (ATM)","field3":"PM10.0 (ATM)","field4":"Uptime","field5":"RSSI","field6":"Temperature","field7":"Humidity","field8":"PM2.5 (CF=1)","created_at":"2020-09-15T16:03:29Z","updated_at":"2020-09-15T16:03:30Z","last_entry_id":8648},"feeds":[{"created_at":"2020-09-26T19:20:00Z","field1":"0.19","field2":"1.77","field3":"1.84","field4":"6696.00","field5":"-42.00","field6":"90.00","field7":"30.00","field8":"1.77"}]}');
const APIQuery = {
  api_key: 'L1C8TB907ZEZE9TJ',
  start: getAPIStart(),
  offset: 0,
  round: 2,
  average: 10,
};
const APIURL = `${ThingSpeakUrl}?${querystring.stringify(APIQuery)}`;

function App() {
  const [APIData, setAPIData] = useState<ThingSpeakJSON>(APIResponseExample);
  useEffect(() => {
    async function fetchAPIData() {
      const thingSpeakRes = await fetch(APIURL);
      const json: ThingSpeakJSON = await thingSpeakRes.json();
      setAPIData(json);
    }
    fetchAPIData();
  }, []);

  const { channel, feeds } = APIData;

  // eslint-disable-next-line max-len
  const apiPointsToFeed = Object.entries(channel).reduce<ApiPointsToFeed>((map, [k, v]) => {
    const updatedMap = { ...map };
    Object.entries(APIPoints).forEach(([_, point]) => {
      if (point === v) {
        updatedMap[point] = k;
      }
    });
    return updatedMap;
  }, {} as ApiPointsToFeed);

  const processedPoints: ProcessedPoint[] = feeds
    .map((point) => {
      const RH = parseFloat(point[apiPointsToFeed[APIPoints.REL_HUMIDITY]]);
      const rawPM25 = parseFloat(point[apiPointsToFeed[APIPoints.PM25]]);
      return {
        tempF: correctTemp(parseFloat(point[apiPointsToFeed[APIPoints.TEMP_F]])),
        relHumidityPerc: RH,
        AQI: convertPM25toAQI(rawPM25, RH),
        tsUTC: point.created_at,
      };
    });

  return (
    <div className="App">
      <Chart data={processedPoints} />
      <CurrentStatus />
      <table>
        <thead>
          <tr>
            <td>
              Timestamp
            </td>
            <td>
              Temp (F)
            </td>
            <td>
              Humidity (%)
            </td>
            <td>
              AQI (US EPA 2.5 with US EPA CF)
            </td>
          </tr>
        </thead>
        <tbody>
          {
            [...processedPoints]
              .sort((a, b) => (a.tsUTC > b.tsUTC ? -1 : 1))
              .slice(0, 50)
              .map(({
                tsUTC, tempF, relHumidityPerc, AQI,
              }) => (
                <tr key={tsUTC}>
                  <td>
                    {new Date(tsUTC).toLocaleString()}
                  </td>
                  <td>
                    {tempF}
                  </td>
                  <td>
                    {relHumidityPerc}
                  </td>
                  <td>
                    {AQI}
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default App;
