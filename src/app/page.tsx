"use client";
import styles from "./page.module.css";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Weather = {
  timestamp: number;
  temperatureC: number;
  humidityPct: number;
  windKph: number;
  rainMm: number;
};

type Reading = {
  timestamp: number;
  gateId: string;
  level: number;
  risk: "low" | "medium" | "high";
};

export default function Home() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    // Mock data: seed four time buckets and update every 10 seconds
    const now = Date.now();
    setWeather({
      timestamp: now,
      temperatureC: 28.2,
      humidityPct: 67,
      windKph: 12,
      rainMm: 0.4,
    });

    const gates = ["north", "south", "east"] as const;
    const seed: Reading[] = [];
    for (let i = 3; i >= 0; i--) {
      const ts = now - i * 30 * 60 * 1000;
      gates.forEach((g, gi) => {
        const base = 12 + gi * 8 + Math.max(0, 25 - i * 6) + (gi === 0 ? i * 3 : 0);
        const level = Math.max(5, base + (Math.random() - 0.5) * 3);
        const risk: Reading["risk"] = level > 32 ? "high" : level > 20 ? "medium" : "low";
        seed.push({ timestamp: ts, gateId: g, level, risk });
      });
    }
    setReadings(seed);

    const interval = setInterval(() => {
      const ts = Date.now();
      const updates: Reading[] = gates.map((g, gi) => {
        const prev = seed.filter((r) => r.gateId === g).slice(-1)[0];
        const jitter = (Math.random() - 0.5) * 4;
        const level = Math.max(5, (prev?.level ?? 20) + jitter);
        const risk: Reading["risk"] = level > 32 ? "high" : level > 20 ? "medium" : "low";
        return { timestamp: ts, gateId: g, level, risk };
      });
      setReadings((curr) => [...updates, ...curr].slice(0, 180));
      setWeather((w) => (w ? { ...w, timestamp: ts, temperatureC: w.temperatureC + (Math.random() - 0.5) * 0.4 } : null));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const recent = useMemo(() => readings[0], [readings]);

  const chartData = useMemo(() => {
    const byTime = new Map<number, { label: string; gate1Out?: number; gate1In?: number; gate3Out?: number }>();
    const now = Date.now();
    const labelFor = (ts: number) => {
      const mins = Math.round((now - ts) / 60000);
      if (mins <= 1) return "RECENT";
      if (mins <= 40) return "30 MINS AGO";
      if (mins <= 75) return "60 MINS AGO";
      return "90 MINS AGO";
    };

    const nameFor = (gateId: string) => {
      if (gateId === "north") return "gate1Out";
      if (gateId === "south") return "gate1In";
      if (gateId === "east") return "gate3Out";
      return undefined;
    };

    for (const r of readings) {
      const key = Math.floor(r.timestamp / 60000) * 60000;
      const ex = byTime.get(key) ?? { label: labelFor(r.timestamp) } as any;
      const name = nameFor(r.gateId);
      if (name) (ex as any)[name] = r.level;
      byTime.set(key, ex);
    }

    const arr = Array.from(byTime.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(-4)
      .map(([, v]) => v);
    return arr;
  }, [readings]);

  const recentLevel = recent?.level ?? 0;
  const riskLabel = recent?.risk ?? "low";

  return (
    <div className={styles.page}>
      <div className={styles.brandTopRight}>
        {/* Logo and titles at the upper-right */}
        <img src="/logobaha.jpg" alt="Logo" className={styles.brandLogo} />
        <div className={styles.brandText}>
          <div className={styles.brandTitle}>H2OBERVER</div>
          <div className={styles.brandSubtitle}>A HELP TO OBESERVE</div>
        </div>
      </div>
      <img src="/logos.jpg" alt="Brand" className={styles.cornerRightLogo} />
      <div className={styles.leftRibbon}>
        <span className={styles.leftRibbonMain}>OBSERVE · PREPARE · RESPOND</span>
        <span className={styles.leftRibbonSub}>A FLOOD DETECTION SYSTEM TO HELP OBSERVE RISING WATER LEVELS</span>
      </div>
      <main className={styles.main}>
        <div className={styles.headerRow}>
          <div className={`${styles.card} ${styles.weatherCard}`}>
            <div className={styles.cardHeader}>
              <img src="/pin.png" alt="Location" className={styles.pinIcon} />
              <span className={styles.weatherTitle}>WEATHER</span>
            </div>
            <div className={styles.weatherBody}>
              <div className={styles.weatherDetails}>
                <div className={styles.locationLine}>Batangas State University Pablo Borbon Main I</div>
                {weather ? (
                  <div className={styles.weatherStats}>
                    <span>{weather.temperatureC.toFixed(1)}°C</span>
                    <span>Humidity {weather.humidityPct.toFixed(0)}%</span>
                    <span>Wind {weather.windKph.toFixed(0)} kph</span>
                    <span>Rain {weather.rainMm.toFixed(1)} mm</span>
                  </div>
                ) : (
                  <div className={styles.muted}>Loading...</div>
                )}
              </div>
              <div className={styles.weatherEmoji}>⛅</div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.riskCard}`}>
            <div className={styles.riskHeaderRow}>
              <span>FLOOD RISK LEVEL</span>
              <span>RECENT: {recentLevel.toFixed(0)} INCHES</span>
            </div>
            <div className={styles.riskPills}>
              <div className={`${styles.riskPill} ${styles.pillHigh}`}>
                <span>20 INCHES AND ABOVE</span>
              </div>
              <div className={`${styles.riskPill} ${styles.pillMedium}`}>
                <span>13-19 INCHES</span>
              </div>
              <div className={`${styles.riskPill} ${styles.pillLow}`}>
                <span className={styles.pillLowLeft}>{riskLabel.toUpperCase()}</span>
                <span className={styles.pillLowRight}>8-12 INCHES</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartBlock}>
          <div className={styles.legendRow}>
            <span className={styles.legendDot1}></span> GATE 1 (OUTSIDE)
            <span className={styles.legendDot2}></span> GATE 1 (INSIDE)
            <span className={styles.legendDot3}></span> GATE 3 (OUTSIDE)
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gate1Out" name="Gate 1 (Outside)" stroke="var(--brand-secondary)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="gate1In" name="Gate 1 (Inside)" stroke="var(--red-500)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="gate3Out" name="Gate 3 (Outside)" stroke="#2d2d2d" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartLabels}>
            <span>90 MINS AGO</span>
            <span>60 MINS AGO</span>
            <span>30 MINS AGO</span>
            <span>RECENT</span>
          </div>
        </div>
      </main>
    </div>
  );
}
