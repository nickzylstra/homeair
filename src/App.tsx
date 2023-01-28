// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useState, useEffect } from 'react';
import { Container, Row, Table } from 'react-bootstrap';
import './App.css';
import { UIDataPointStored, ChartDataPoint } from './types';
import CurrentStatus from './CurrentStatus';
import Chart from './Chart';
import { UIDPFromStorage } from './utils';
import { KV_SENSOR_HISTORY_KEY, sensors } from './config';

function App() {
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  useEffect(() => {
    async function fetchAPIData() {
      const res = await fetch(`/api/${KV_SENSOR_HISTORY_KEY}`);
      if (!res.ok) {
        throw new Error(`error fetching kv data: ${res.status} - ${await res.text()}`);
      }
      const APIHistoryStored = await res.json<UIDataPointStored[]>();
      const APIhistory = APIHistoryStored.map((p) => {
        const UIDP = UIDPFromStorage(p);
        const chartDP: ChartDataPoint = {
          ...UIDP,
          tsLocal: new Date(UIDP.tsUTC).toLocaleString(),
        };
        return chartDP;
      });
      setHistory(APIhistory);
    }
    fetchAPIData();
    let timer: NodeJS.Timeout;
    function tick() {
      if (document.hasFocus()) {
        fetchAPIData();
      }
      timer = setTimeout(tick, 1000 * 15);
    }
    tick();
    return () => clearTimeout(timer);
  }, []);

  const recentPoints = history
    .slice(history.length - 60, history.length)
    .sort((a, b) => b.tsSortable - a.tsSortable);

  return (
    <div className="App">
      <Container fluid>
        <Row>
          <Chart data={history} />
        </Row>
        <Row>
          <CurrentStatus />
        </Row>
        <Row>
          <Table striped bordered hover>
            <thead>
              <tr>
                <td>Timestamp</td>
                <td>Temp Avg Outside (F)</td>
                <td>Temp Inside (F)</td>
                <td>Humidity Inside (%)</td>
                <td>AQI Inside (US EPA 2.5 with US EPA CF)</td>
                <td>AQI {sensors.outside1.name} Outside (US EPA 2.5 with US EPA CF)</td>
                <td>AQI {sensors.outside2.name} Outside (US EPA 2.5 with US EPA CF)</td>
              </tr>
            </thead>
            <tbody>
              {recentPoints.map(
                ({
                  tsLocal,
                  outsideAvgTempF,
                  ourHouseTempF,
                  ourHouseRelHumidityPerc,
                  ourHouseAQI,
                  outside1AQI,
                  outside2AQI,
                }) => (
                  <tr key={tsLocal}>
                    <td>{tsLocal}</td>
                    <td>{outsideAvgTempF}</td>
                    <td>{ourHouseTempF}</td>
                    <td>{ourHouseRelHumidityPerc}</td>
                    <td>{ourHouseAQI}</td>
                    <td>{outside1AQI}</td>
                    <td>{outside2AQI}</td>
                  </tr>
                ),
              )}
            </tbody>
          </Table>
        </Row>
      </Container>
    </div>
  );
}

export default App;
