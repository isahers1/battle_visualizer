"use client";

import { useMemo } from "react";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

function SnowParticles({ intensity }: { intensity: number }) {
  const particles = useMemo(() => {
    const count = Math.floor(intensity * 80);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.3 + Math.random() * 0.4,
      drift: -20 + Math.random() * 40,
    }));
  }, [intensity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-10px) translateX(0px); opacity: 0; }
          10% { opacity: var(--snow-opacity); }
          90% { opacity: var(--snow-opacity); }
          100% { transform: translateY(100vh) translateX(var(--snow-drift)); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: "white",
            ["--snow-opacity" as string]: p.opacity,
            ["--snow-drift" as string]: `${p.drift}px`,
            animation: `snowfall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function RainParticles({ intensity }: { intensity: number }) {
  const particles = useMemo(() => {
    const count = Math.floor(intensity * 60);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 0.6 + Math.random() * 0.8,
      opacity: 0.15 + Math.random() * 0.25,
    }));
  }, [intensity]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      <style>{`
        @keyframes rainfall {
          0% { transform: translateY(-20px) translateX(-10px); opacity: 0; }
          10% { opacity: var(--rain-opacity); }
          100% { transform: translateY(100vh) translateX(-40px); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: "1px",
            height: "12px",
            background: `rgba(180, 200, 220, ${p.opacity})`,
            transform: "rotate(15deg)",
            ["--rain-opacity" as string]: p.opacity,
            animation: `rainfall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function FogOverlay({ intensity }: { intensity: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[5]"
      style={{
        background: `rgba(200, 200, 210, ${intensity * 0.15})`,
        backdropFilter: `blur(${intensity * 1.5}px)`,
      }}
    />
  );
}

export function WeatherParticles() {
  const snapshot = useCurrentSnapshot();

  if (!snapshot) return null;

  const { condition, visibility } = snapshot.weather;

  // Compute intensity from condition + visibility
  const visIntensity =
    visibility === "very_low" ? 1.0 :
    visibility === "low" ? 0.7 :
    visibility === "moderate" ? 0.4 : 0.2;

  switch (condition) {
    case "snow":
      return <SnowParticles intensity={visIntensity * 0.7} />;
    case "heavy_snow":
      return <SnowParticles intensity={visIntensity} />;
    case "rain":
    case "freezing_rain":
      return <RainParticles intensity={visIntensity * 0.8} />;
    case "fog":
      return <FogOverlay intensity={visIntensity} />;
    case "overcast":
      return visibility === "very_low" || visibility === "low"
        ? <FogOverlay intensity={visIntensity * 0.4} />
        : null;
    default:
      return null;
  }
}
