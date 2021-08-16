// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useState, useEffect } from 'react';
import './App.css';
import {
  ThingSpeakData, ThingsSpeakEndpoint, DataSet, DataPoint,
} from './types';
import CurrentStatus from './CurrentStatus';
import Chart from './Chart';
import { getFullAPIEndpoint, processAPIData } from './utils';

const OurHouse: ThingsSpeakEndpoint = {
  name: 'Our House',
  url: 'https://api.thingspeak.com/channels/1146562/feeds.json',
  apiKey: 'L1C8TB907ZEZE9TJ',
};
const Neighbor1: ThingsSpeakEndpoint = {
  name: 'Neighbor1',
  url: 'https://api.thingspeak.com/channels/1194602/feeds.json',
  apiKey: 'UGXESE5LBNFCLG8O',
};
const Neighbor2: ThingsSpeakEndpoint = {
  name: 'Neighbor2',
  url: 'https://api.thingspeak.com/channels/317289/feeds.json',
  apiKey: 'IYK4R5V4JG2FZA6T',
};
const APIResponseExample = JSON.parse('{"channel":{"id":1146562,"name":"AirMonitor_965","latitude":"0.0","longitude":"0.0","field1":"PM1.0 (ATM)","field2":"PM2.5 (ATM)","field3":"PM10.0 (ATM)","field4":"Uptime","field5":"RSSI","field6":"Temperature","field7":"Humidity","field8":"PM2.5 (CF=1)","created_at":"2020-09-15T16:03:29Z","updated_at":"2020-09-15T16:03:30Z","last_entry_id":8648},"feeds":[{"created_at":"2020-09-26T19:20:00Z","field1":"0.19","field2":"1.77","field3":"1.84","field4":"6696.00","field5":"-42.00","field6":"90.00","field7":"30.00","field8":"1.77"}]}');
const APIDataInit: DataSet = {
  ourHouse: processAPIData(APIResponseExample),
  neighbor1: processAPIData(APIResponseExample),
  neighbor2: processAPIData(APIResponseExample),
};

function normData(d: DataSet): DataPoint[] {
  const m = new Map<DataPoint['tsLocal'], DataPoint>();
  d.ourHouse.forEach((p) => {
    const pDate = new Date(p.tsUTC);
    const pDateLocal = pDate.toLocaleString();
    m.set(pDateLocal, {
      tsLocal: pDateLocal,
      tsSortable: pDate.valueOf(),
      ourHouseAQI: p.AQI,
      ourHouseRelHumidityPerc: p.relHumidityPerc,
      ourHouseTempF: p.tempF,
    });
  });
  d.neighbor1.forEach((p) => {
    const pDate = new Date(p.tsUTC);
    const pDateLocal = pDate.toLocaleString();
    const eP = m.get(pDateLocal);
    m.set(pDateLocal, {
      tsLocal: pDateLocal,
      tsSortable: pDate.valueOf(),
      ...(eP ?? {}),
      outside1AQI: p.AQI,
    });
  });
  d.neighbor2.forEach((p) => {
    const pDate = new Date(p.tsUTC);
    const pDateLocal = pDate.toLocaleString();
    const eP = m.get(pDateLocal);
    m.set(pDateLocal, {
      tsLocal: pDateLocal,
      tsSortable: pDate.valueOf(),
      ...(eP ?? {}),
      outside2AQI: p.AQI,
      outsideAvgAQI: (eP?.outside1AQI ? (eP.outside1AQI + p.AQI) / 2 : p.AQI),
    });
  });

  return Array.from(m.values()).sort((a, b) => a.tsSortable - b.tsSortable);
}

function App() {
  const [APIData, setAPIData] = useState<DataSet>(APIDataInit);
  useEffect(() => {
    async function fetchAPIData() {
      const responses = await Promise.all([
        fetch(getFullAPIEndpoint(OurHouse)),
        fetch(getFullAPIEndpoint(Neighbor1)),
        fetch(getFullAPIEndpoint(Neighbor2)),
      ]);
      const datas = await Promise.all(responses.map(async (r) => {
        const d: ThingSpeakData = await r.json();
        return processAPIData(d);
      }));
      setAPIData({
        ourHouse: datas[0],
        neighbor1: datas[1],
        neighbor2: datas[2],
      });
    }
    fetchAPIData();
  }, []);

  const normedDataPoints = normData(APIData);

  const recent50Points = [...normedDataPoints]
    .sort((a, b) => b.tsSortable - a.tsSortable)
    .slice(0, 50);

  return (
    <div className="App">
      <Chart data={normedDataPoints} />
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
              AQI Inside (US EPA 2.5 with US EPA CF)
            </td>
            <td>
              AQI Neighbor 1 Outside (US EPA 2.5 with US EPA CF)
            </td>
            <td>
              AQI Neighbor 2 Outside (US EPA 2.5 with US EPA CF)
            </td>
          </tr>
        </thead>
        <tbody>
          {
            recent50Points.map(({
              tsLocal,
              ourHouseTempF,
              ourHouseRelHumidityPerc,
              ourHouseAQI,
              outside1AQI,
              outside2AQI,
            }) => (
              <tr key={tsLocal}>
                <td>
                  {tsLocal}
                </td>
                <td>
                  {ourHouseTempF}
                </td>
                <td>
                  {ourHouseRelHumidityPerc}
                </td>
                <td>
                  {ourHouseAQI}
                </td>
                <td>
                  {outside1AQI}
                </td>
                <td>
                  {outside2AQI}
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
