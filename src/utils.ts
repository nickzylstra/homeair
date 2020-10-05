import { subDays } from 'date-fns';

// USA EPA AQI Conversion for recommended for wildfire smoke
// https://www.purpleair.com/map?opt=1/i/mAQI/a10/cC5#11.25/37.8076/-122.3897
// 0-250 ug/m3 range (>250 may underestimate true PM2.5):
// PM2.5 (µg/m³) = 0.534 x PA(cf_1) - 0.0844 x RH + 5.604
function PurpleAirPM25toUSEPAPM25(PM25: number, RH: number) {
  return 0.534 * PM25 - 0.0844 * RH + 5.604;
}

// https://cfpub.epa.gov/airnow/index.cfm?action=airnow.calculator
function PM25toAQI(PM25: number) {
  function Linear(
    AQIhigh: number,
    AQIlow: number,
    Conchigh: number,
    Conclow: number,
    Concentration: number,
  ) {
    // from PA API docs: https://docs.google.com/document/d/15ijz94dXJ-YAZLi9iZ_RaBwrZ4KtYeCy08goGBwnbCU/edit
    const AQI = ((Concentration - Conclow) / (Conchigh - Conclow)) * (AQIhigh - AQIlow) + AQIlow;
    return Math.round(AQI);
  }

  const c = (Math.floor(10 * PM25)) / 10;
  if (c >= 0 && c < 12.1) {
    return Linear(50, 0, 12, 0, c);
  }
  if (c >= 12.1 && c < 35.5) {
    return Linear(100, 51, 35.4, 12.1, c);
  }
  if (c >= 35.5 && c < 55.5) {
    return Linear(150, 101, 55.4, 35.5, c);
  }
  if (c >= 55.5 && c < 150.5) {
    return Linear(200, 151, 150.4, 55.5, c);
  }
  if (c >= 150.5 && c < 250.5) {
    return Linear(300, 201, 250.4, 150.5, c);
  }
  if (c >= 250.5 && c < 350.5) {
    return Linear(400, 301, 350.4, 250.5, c);
  }
  if (c >= 350.5 && c < 500.5) {
    return Linear(500, 401, 500.4, 350.5, c);
  }
  return NaN;
}

// eslint-disable-next-line import/prefer-default-export
export function convertPM25toAQI(PM25: number, RH: number) {
  return PM25toAQI(PurpleAirPM25toUSEPAPM25(PM25, RH));
}

export function correctTemp(tempF: number) {
  return Math.round(10 * (tempF - 10.2)) / 10;
}

export function getAPIStart(date?: Date, daysSpan = 7) {
  return subDays(date ?? new Date(), daysSpan)
    .toISOString()
    .replace('T', ' ')
    .slice(0, -5);
}
