import { ImageResponse } from "next/og";
import { LAUNCH_DATE, MS_PER_DIGIT, PI_DECIMALS_FALLBACK } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const now = Date.now();
  const launched = now >= LAUNCH_DATE.getTime();
  const elapsed = launched ? now - LAUNCH_DATE.getTime() : 0;
  const totalRevealed = launched ? Math.floor(elapsed / MS_PER_DIGIT) + 1 : 0;
  const displayCount = Math.min(totalRevealed, PI_DECIMALS_FALLBACK.length);
  const latestDigits = PI_DECIMALS_FALLBACK.substring(
    Math.max(0, displayCount - 20),
    displayCount
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 160,
            color: "#f59e0b",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          π
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#9ca3af",
            marginBottom: 40,
          }}
        >
          One digit. Every minute. Forever.
        </div>
        {launched && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 32,
              color: "#6b7280",
              letterSpacing: "0.1em",
            }}
          >
            <span style={{ fontSize: 48, color: "#ffffff", fontWeight: 700 }}>
              3.
            </span>
            <span>...{latestDigits.slice(0, -1)}</span>
            <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 48 }}>
              {latestDigits.slice(-1)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 40,
            fontSize: 24,
            color: "#4b5563",
          }}
        >
          {launched && (
            <span>
              {totalRevealed.toLocaleString()} digits revealed
            </span>
          )}
          <span>pistream.xyz</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
