// eslint-disable-next-line
import React, { useState, useEffect } from 'react';
import './App.css';

interface ThingSpeakJSON {
  channel: Record<string, string>;
  feeds: Record<string, string>[];
}

const ThingSpeakUrl = 'https://api.thingspeak.com/channels/1146562/feeds.json?start=2020-09-26%2019:23:07&offset=0&round=2&average=10&api_key=L1C8TB907ZEZE9TJ';
const APIResponseExample = '{"channel":{"id":1146562,"name":"AirMonitor_965","latitude":"0.0","longitude":"0.0","field1":"PM1.0 (ATM)","field2":"PM2.5 (ATM)","field3":"PM10.0 (ATM)","field4":"Uptime","field5":"RSSI","field6":"Temperature","field7":"Humidity","field8":"PM2.5 (CF=1)","created_at":"2020-09-15T16:03:29Z","updated_at":"2020-09-15T16:03:30Z","last_entry_id":8648},"feeds":[{"created_at":"2020-09-26T19:20:00Z","field1":"0.19","field2":"1.77","field3":"1.84","field4":"6696.00","field5":"-42.00","field6":"90.00","field7":"30.00","field8":"1.77"}]}';

// const json: ThingSpeakJSON = JSON.parse(res);
// const { channel, feeds } = json;

// const parsedData: Partial<Record<keyof typeof pointMap, number>> = {};
// Object.entries(pointMap).forEach(([point, key]) => {
//   let dataVal = parseFloat(data[0][fields.indexOf(key)]);
//   if (point.includes('pm')) {
//     dataVal = convertPm25ToAQI(dataVal);
//   }
//   parsedData[point as keyof typeof pointMap] = dataVal;
// });

function App() {
  const [APIData, setAPIData] = useState<ThingSpeakJSON | null>(null);
  useEffect(() => {
    async function fetchAPIData() {
      const thingSpeakRes = await fetch(ThingSpeakUrl);
      const json: ThingSpeakJSON = await thingSpeakRes.json();
      setAPIData(json);
    }
    fetchAPIData();
  }, []);
  return (
    <div className="App">
      {JSON.stringify(APIData)}
    </div>
  );
}

export default App;
