import type { CSSProperties } from "react";

/** Semi grows with the user's habits (not results): 1 = semilla, 2 = brote, 3 = plantita. */
export type SemiStage = 1 | 2 | 3;

type Props = { stage?: SemiStage; asleep?: boolean; size: number; className?: string };

// Shapes are positioned in % of the box, ported from the "Semi" component in the Nido design.
const part = (style: CSSProperties): CSSProperties => ({ position: "absolute", ...style });
const INK = "#1D2928";

export default function Semi({ stage = 2, asleep = false, size, className = "" }: Props) {
  return (
    <div aria-hidden className={`relative flex-none ${className}`} style={{ width: size, height: size }}>
      <div style={part({ left: "48%", top: "9%", width: "4%", height: "22%", background: "oklch(0.6 0.12 150)", borderRadius: 4 })} />
      <div
        style={part({
          left: "51%",
          top: "5%",
          width: "27%",
          height: "14%",
          background: "oklch(0.72 0.14 145)",
          borderRadius: "0 100% 0 100%",
          transform: "rotate(-14deg)",
        })}
      />
      {stage >= 2 && (
        <div
          style={part({
            right: "51%",
            top: "9%",
            width: "22%",
            height: "12%",
            background: "oklch(0.66 0.13 148)",
            borderRadius: "100% 0 100% 0",
            transform: "rotate(14deg)",
          })}
        />
      )}
      {stage >= 3 && (
        <div
          style={part({
            left: "62%",
            top: 0,
            width: "14%",
            height: "14%",
            background: "oklch(0.72 0.14 30)",
            borderRadius: "50%",
            boxShadow: "inset 0 0 0 3px oklch(0.85 0.12 85)",
          })}
        />
      )}
      <div
        style={part({
          left: "13%",
          top: "27%",
          width: "74%",
          height: "70%",
          background: "oklch(0.8 0.1 172)",
          borderRadius: "50% 50% 46% 46% / 58% 58% 42% 42%",
          boxShadow: "inset -6px -8px 0 rgba(0,0,0,.07)",
        })}
      />
      <div style={part({ left: "31%", top: "60%", width: "38%", height: "28%", background: "rgba(255,255,255,.32)", borderRadius: "50%" })} />
      {asleep ? (
        <>
          <div style={part({ left: "31%", top: "53%", width: "12%", height: "3.5%", background: INK, borderRadius: 99 })} />
          <div style={part({ left: "57%", top: "53%", width: "12%", height: "3.5%", background: INK, borderRadius: 99 })} />
        </>
      ) : (
        <>
          <div style={part({ left: "33%", top: "49%", width: "8%", height: "10%", background: INK, borderRadius: "50%" })} />
          <div style={part({ left: "59%", top: "49%", width: "8%", height: "10%", background: INK, borderRadius: "50%" })} />
        </>
      )}
      <div style={part({ left: "22%", top: "60%", width: "11%", height: "6%", background: "oklch(0.75 0.12 30 / .6)", borderRadius: "50%" })} />
      <div style={part({ left: "67%", top: "60%", width: "11%", height: "6%", background: "oklch(0.75 0.12 30 / .6)", borderRadius: "50%" })} />
      <div
        style={part({
          left: "44%",
          top: "58%",
          width: "12%",
          height: "7%",
          borderBottom: `${Math.max(1.5, size / 64)}px solid ${INK}`,
          borderRadius: "0 0 50% 50%",
          boxSizing: "border-box",
        })}
      />
    </div>
  );
}
