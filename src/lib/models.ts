import { z } from 'zod';

export const WeatherSchema = z.object({
  timestamp: z.number().int(), // ms since epoch
  temperatureC: z.number(),
  humidityPct: z.number().min(0).max(100),
  windKph: z.number().min(0),
  rainMm: z.number().min(0),
});
export type Weather = z.infer<typeof WeatherSchema>;

export const ReadingSchema = z.object({
  timestamp: z.number().int(),
  gateId: z.string(),
  level: z.number(),
  risk: z.enum(['low', 'medium', 'high']),
});
export type Reading = z.infer<typeof ReadingSchema>;

export const MultiGateSnapshotSchema = z.object({
  timestamp: z.number().int(),
  gates: z.array(
    z.object({ gateId: z.string(), level: z.number(), risk: z.string() })
  ),
});
export type MultiGateSnapshot = z.infer<typeof MultiGateSnapshotSchema>;


