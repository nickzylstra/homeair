// eslint-disable-next-line
import React, { useState, useEffect } from 'react';
import querystring from 'querystring';
import './App.css';
import CurrentStatus from './CurrentStatus';
import { convertPM25toAQI, correctTemp, getAPIStart } from './utils';

interface ThingSpeakJSON {
  channel: Record<string, string>;
  feeds: Record<string, string>[];
}

enum APIPoints {
  TEMP_F = 'Temperature',
  REL_HUMIDITY = 'Humidity',
  // Docs say firmware is incorrectly labeled, will switch to 'PM2.5 (CF=ATM)' once corrected.
  // PM25 = 'PM2.5 (CF=1)',
  // ATM matches map data though, wonder if my sensor is reporting correct data
  PM25 = 'PM2.5 (ATM)',
}

type ApiPointsToFeed = Record<APIPoints, string>;

interface ProcessedPoint {
  tempF: number;
  relHumidityPerc: number;
  AQI: number;
  tsUTC: string;
}

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
    })
    .sort((a, b) => (a.tsUTC > b.tsUTC ? -1 : 1));

  return (
    <div className="App">
      <CurrentStatus />
      <table>
        {processedPoints.map((p) => <tr>{JSON.stringify(p)}</tr>)}
      </table>
    </div>
  );
}

export default App;
