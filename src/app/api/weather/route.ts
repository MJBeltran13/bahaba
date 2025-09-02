import { NextRequest } from 'next/server';

// Use Open-Meteo to provide live weather for Batangas State University (approx coords)
// https://open-meteo.com/en/docs
export async function GET() {
  try {
    const latitude = 13.7563;
    const longitude = 121.0583;
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
      timezone: 'UTC',
    });
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 10 } });
    if (!res.ok) {
      return new Response('Failed to fetch weather', { status: 502 });
    }
    const json = await res.json();

    const times: string[] = json?.hourly?.time ?? [];
    const temps: number[] = json?.hourly?.temperature_2m ?? [];
    const humid: number[] = json?.hourly?.relative_humidity_2m ?? [];
    const wind: number[] = json?.hourly?.wind_speed_10m ?? [];
    const rain: number[] = json?.hourly?.precipitation ?? [];

    if (!times.length) {
      return new Response('Weather data unavailable', { status: 500 });
    }

    // Find the entry closest to the current UTC hour
    const nowIsoHour = new Date().toISOString().slice(0, 13) + ':00';
    let idx = times.indexOf(nowIsoHour);
    if (idx === -1) {
      // fallback: choose the latest past hour
      const nowMs = Date.parse(new Date().toISOString());
      let bestIdx = 0;
      let bestDelta = Number.POSITIVE_INFINITY;
      for (let i = 0; i < times.length; i++) {
        const tMs = Date.parse(times[i] + 'Z');
        const delta = Math.abs(nowMs - tMs);
        if (tMs <= nowMs && delta < bestDelta) {
          bestDelta = delta;
          bestIdx = i;
        }
      }
      idx = bestIdx;
    }

    const payload = {
      timestamp: Date.parse(times[idx] + 'Z'),
      temperatureC: Number(temps[idx] ?? NaN),
      humidityPct: Number(humid[idx] ?? NaN),
      // Open-Meteo wind_speed_10m is in km/h by default for metric
      windKph: Number(wind[idx] ?? NaN),
      rainMm: Number(rain[idx] ?? 0),
      source: 'open-meteo',
      units: {
        temperatureC: json?.hourly_units?.temperature_2m ?? '°C',
        humidityPct: json?.hourly_units?.relative_humidity_2m ?? '%',
        windKph: json?.hourly_units?.wind_speed_10m ?? 'km/h',
        rainMm: json?.hourly_units?.precipitation ?? 'mm',
      },
      coordinates: { latitude, longitude },
    };

    return Response.json(payload);
  } catch (err) {
    return new Response('Unexpected error fetching weather', { status: 500 });
  }
}

// Retain POST signature for compatibility, but disable writing
export async function POST(_req: NextRequest) {
  return new Response('POST not supported for live weather', { status: 405 });
}

