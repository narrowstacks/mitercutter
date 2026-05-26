"use client";

import { useState, type ReactNode } from "react";

type Mode = "fraction" | "decimal";

type Preset = { label: string; w: number; h: number };

const PRESETS: readonly Preset[] = [
  { label: "4×6", w: 4, h: 6 },
  { label: "5×7", w: 5, h: 7 },
  { label: "8×10", w: 8, h: 10 },
  { label: "11×14", w: 11, h: 14 },
  { label: "16×20", w: 16, h: 20 },
  { label: "18×24", w: 18, h: 24 },
  { label: "20×24", w: 20, h: 24 },
];

function parseInput(str: string | number): number {
  if (typeof str === "number") return str;
  if (str === "" || str == null) return NaN;
  const s = String(str).trim();
  const m1 = s.match(/^(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)$/);
  if (m1) return parseFloat(m1[1]) + parseInt(m1[2]) / parseInt(m1[3]);
  const m2 = s.match(/^(\d+)\/(\d+)$/);
  if (m2) return parseInt(m2[1]) / parseInt(m2[2]);
  return parseFloat(s);
}

function toFraction(decimal: number, denom = 16): string {
  if (isNaN(decimal) || decimal < 0) return "";
  const whole = Math.floor(decimal + 1e-9);
  const frac = decimal - whole;
  let numer = Math.round(frac * denom);
  let d = denom;
  if (numer >= d) return `${whole + 1}"`;
  if (numer === 0) return `${whole}"`;
  while (numer % 2 === 0 && d % 2 === 0) {
    numer /= 2;
    d /= 2;
  }
  return whole === 0 ? `${numer}/${d}"` : `${whole} ${numer}/${d}"`;
}

export default function FrameCalculator() {
  const [glassW, setGlassW] = useState("11");
  const [glassH, setGlassH] = useState("14");
  const [molding, setMolding] = useState("1");
  const [rabbet, setRabbet] = useState("1/4");
  const [allowance, setAllowance] = useState("1/16");
  const [mode, setMode] = useState<Mode>("fraction");

  const gw = parseInput(glassW);
  const gh = parseInput(glassH);
  const mw = parseInput(molding);
  const rw = parseInput(rabbet);
  const alRaw = parseInput(allowance);
  const al = isNaN(alRaw) ? 0 : alRaw;

  const valid =
    !isNaN(gw) &&
    !isNaN(gh) &&
    !isNaN(mw) &&
    !isNaN(rw) &&
    gw > 0 &&
    gh > 0 &&
    mw > 0 &&
    rw > 0 &&
    mw > rw;

  const wShort = Math.min(gw, gh);
  const wLong = Math.max(gw, gh);
  const overhang = mw - rw;

  const outerShort = wShort + 2 * overhang + 2 * al;
  const outerLong = wLong + 2 * overhang + 2 * al;
  const innerShort = outerShort - 2 * mw;
  const innerLong = outerLong - 2 * mw;
  const rabbetShort = wShort + 2 * al;
  const rabbetLong = wLong + 2 * al;

  const fmt = (v: number): string => {
    if (!valid || isNaN(v)) return "· · ·";
    return mode === "fraction" ? toFraction(v) : `${v.toFixed(3)}"`;
  };

  const vbW = 400;
  const pad = 48;
  const drawW = vbW - 2 * pad;
  const aspect = valid && outerShort > 0 ? outerLong / outerShort : 1.27;
  const drawH = drawW * aspect;
  const vbH = drawH + 2 * pad;
  const insetRatio = valid && outerShort > 0 ? mw / outerShort : 0.13;
  const inset = insetRatio * drawW;

  const miterLines: Array<[number, number, number, number]> = [
    [pad, pad, pad + inset, pad + inset],
    [pad + drawW, pad, pad + drawW - inset, pad + inset],
    [pad, pad + drawH, pad + inset, pad + drawH - inset],
    [pad + drawW, pad + drawH, pad + drawW - inset, pad + drawH - inset],
  ];

  return (
    <main className="px-[14px] pt-6 pb-[60px]">
      <div className="mx-auto max-w-[720px]">
        <header className="mb-[22px] border-b-2 border-ink pb-[14px]">
          <div className="mb-[6px] font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Shop Reference · Picture Framing
          </div>
          <h1 className="m-0 font-display text-[clamp(28px,7vw,38px)] font-medium leading-[1.05] tracking-[-0.02em]">
            Miter Cut Calculator
          </h1>
          <div className="mt-1 font-display text-[15px] italic text-ink-soft">
            for mitered moldings with a rabbeted glass opening
          </div>
        </header>

        <FieldGroup label="01 · Glass dimensions">
          <div className="mb-[10px] flex gap-[10px]">
            <Field label="Width" value={glassW} onChange={setGlassW} />
            <Field label="Height" value={glassH} onChange={setGlassH} />
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {PRESETS.map((p) => {
              const active =
                parseInput(glassW) === p.w && parseInput(glassH) === p.h;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setGlassW(String(p.w));
                    setGlassH(String(p.h));
                  }}
                  className={
                    "rounded-none border px-[10px] py-1 font-mono text-[11px] cursor-pointer " +
                    (active
                      ? "border-ink bg-ink text-paper"
                      : "border-rule bg-transparent text-ink-soft")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup label="02 · Molding profile">
          <div className="flex gap-[10px]">
            <Field label="Face width" value={molding} onChange={setMolding} />
            <Field label="Rabbet width" value={rabbet} onChange={setRabbet} />
          </div>
          <div className="mt-[6px] font-display text-[12px] italic text-ink-soft">
            Rabbet is the lip that covers the front edge of the glass; must be
            smaller than face width.
          </div>
        </FieldGroup>

        <FieldGroup label="03 · Fit allowance (per side)">
          <Field
            label="Extra play for glass in the rabbet"
            value={allowance}
            onChange={setAllowance}
            full
          />
        </FieldGroup>

        {!valid && (
          <div className="mb-[18px] border border-accent bg-accent-soft px-[14px] py-[10px] font-sans text-[13px] text-accent">
            Check inputs. All values must be positive and the rabbet width must
            be smaller than the face width.
          </div>
        )}

        <div className="mb-[14px] flex w-fit border border-ink">
          {(["fraction", "decimal"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                "cursor-pointer border-none px-[14px] py-[6px] font-mono text-[11px] uppercase tracking-[0.1em] " +
                (mode === m ? "bg-ink text-paper" : "bg-transparent text-ink")
              }
            >
              {m === "fraction" ? "1/16 in" : "Decimal"}
            </button>
          ))}
        </div>

        <section className="relative mb-[22px] border border-ink bg-paper-deep p-[18px]">
          <div className="mb-[14px] font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Cut Lengths · long point to long point
          </div>
          <div className="grid grid-cols-2 gap-[14px]">
            <ResultBlock label="Short pieces (×2)" value={fmt(outerShort)} />
            <ResultBlock label="Long pieces (×2)" value={fmt(outerLong)} />
          </div>
        </section>

        <section className="mb-[22px]">
          <SectionLabel>Frame Layout · Front View</SectionLabel>
          <div className="border border-rule bg-white p-[12px]">
            <svg
              viewBox={`0 0 ${vbW} ${vbH}`}
              className="block h-auto w-full max-h-[460px]"
            >
              <defs>
                <pattern
                  id="hatch"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    className="stroke-ink-soft"
                    strokeWidth="0.5"
                    opacity="0.35"
                  />
                </pattern>
              </defs>

              <path
                d={`M ${pad} ${pad}
                    L ${pad + drawW} ${pad}
                    L ${pad + drawW} ${pad + drawH}
                    L ${pad} ${pad + drawH} Z
                    M ${pad + inset} ${pad + inset}
                    L ${pad + inset} ${pad + drawH - inset}
                    L ${pad + drawW - inset} ${pad + drawH - inset}
                    L ${pad + drawW - inset} ${pad + inset} Z`}
                fill="url(#hatch)"
                fillRule="evenodd"
              />

              <rect
                x={pad}
                y={pad}
                width={drawW}
                height={drawH}
                fill="none"
                className="stroke-ink"
                strokeWidth="1.6"
              />

              <rect
                x={pad + inset}
                y={pad + inset}
                width={drawW - 2 * inset}
                height={drawH - 2 * inset}
                fill="none"
                className="stroke-ink"
                strokeWidth="1"
              />

              {miterLines.map((c, i) => (
                <line
                  key={i}
                  x1={c[0]}
                  y1={c[1]}
                  x2={c[2]}
                  y2={c[3]}
                  className="stroke-accent"
                  strokeWidth="0.9"
                  strokeDasharray="4,2.5"
                />
              ))}

              <text
                x={pad + drawW / 2}
                y={pad - 14}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                className="fill-accent font-mono"
              >
                {fmt(outerShort)}
              </text>
              <text
                x={pad + drawW / 2}
                y={pad - 26}
                textAnchor="middle"
                fontSize="8.5"
                letterSpacing="0.12em"
                className="fill-ink-soft font-mono"
              >
                OUTER · LONG POINT
              </text>

              <g
                transform={`translate(${pad + drawW + 14}, ${pad + drawH / 2}) rotate(90)`}
              >
                <text
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  className="fill-accent font-mono"
                >
                  {fmt(outerLong)}
                </text>
                <text
                  textAnchor="middle"
                  fontSize="8.5"
                  letterSpacing="0.12em"
                  y={-14}
                  className="fill-ink-soft font-mono"
                >
                  OUTER · LONG POINT
                </text>
              </g>

              <text
                x={pad + drawW / 2}
                y={pad + drawH / 2 - 8}
                textAnchor="middle"
                fontSize="9"
                letterSpacing="0.18em"
                className="fill-ink-soft font-mono"
              >
                SIGHT OPENING
              </text>
              <text
                x={pad + drawW / 2}
                y={pad + drawH / 2 + 8}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                className="fill-ink font-mono"
              >
                {fmt(innerShort)} × {fmt(innerLong)}
              </text>
              <text
                x={pad + drawW / 2}
                y={pad + drawH / 2 + 24}
                textAnchor="middle"
                fontSize="11"
                fontStyle="italic"
                className="fill-ink-soft font-display"
              >
                (inner edge, short point to short point)
              </text>
            </svg>
          </div>
        </section>

        <section className="mb-6">
          <SectionLabel>All Dimensions</SectionLabel>
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {(
                [
                  [
                    "Outer frame (long point)",
                    `${fmt(outerShort)} × ${fmt(outerLong)}`,
                    "outside edges of molding",
                  ],
                  [
                    "Inner frame (short point)",
                    `${fmt(innerShort)} × ${fmt(innerLong)}`,
                    "inner face edge, also the sight opening",
                  ],
                  [
                    "Rabbet opening",
                    `${fmt(rabbetShort)} × ${fmt(rabbetLong)}`,
                    "recess at the back where the glass sits",
                  ],
                  [
                    "Glass",
                    `${fmt(wShort)} × ${fmt(wLong)}`,
                    "as specified",
                  ],
                ] as const
              ).map((row, i) => (
                <tr key={i} className="border-t border-rule">
                  <td className="w-[38%] py-[10px] pr-2 align-top">{row[0]}</td>
                  <td className="w-[32%] whitespace-nowrap px-2 py-[10px] align-top font-mono font-medium">
                    {row[1]}
                  </td>
                  <td className="py-[10px] align-top font-display text-[12px] italic text-ink-soft">
                    {row[2]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="border-t border-rule pt-[14px]">
          <div className="mb-[10px] font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Notes
          </div>
          <ul className="m-0 list-disc pl-[18px] font-display text-[14px] leading-[1.55] text-ink">
            <li>
              Cut lengths are measured along the outer edge of the molding, long
              point to long point.
            </li>
            <li>
              The inner edge of each cut piece is{" "}
              {fmt(2 * (isNaN(mw) ? 0 : mw))} shorter than the outer (twice the
              face width).
            </li>
            <li>
              Inputs accept decimals like 1.5, or fractions like 1 1/2 or 1/4.
            </li>
            <li>
              Cut all four pieces from one continuous run to keep grain and
              profile aligned around the corners.
            </li>
            <li>
              Verify the rabbet depth separately; it has to clear glass plus mat
              plus backer plus retention hardware.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  full,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  full?: boolean;
}) {
  return (
    <div className={"min-w-0 " + (full ? "flex-[1_1_100%]" : "flex-1")}>
      <label className="mb-1 block font-sans text-[11px] text-ink-soft">
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="box-border w-full rounded-none border border-ink bg-white px-[10px] py-[9px] font-mono text-[16px] text-ink outline-none"
      />
    </div>
  );
}

function ResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 font-sans text-[12px] text-ink-soft">{label}</div>
      <div className="font-mono text-[clamp(22px,7vw,34px)] font-medium leading-none tracking-[-0.01em] text-accent">
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
      {children}
    </div>
  );
}
