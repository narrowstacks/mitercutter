"use client";

import { useState } from "react";
import {
  Field,
  FieldGroup,
  makeFmt,
  ModeToggle,
  parseInput,
  ResultBlock,
  SectionLabel,
  type Mode,
} from "../_components/shared";

type View = "front" | "rabbet";

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

export default function FrameCalculator() {
  const [glassW, setGlassW] = useState("11");
  const [glassH, setGlassH] = useState("14");
  const [molding, setMolding] = useState("1");
  const [rabbet, setRabbet] = useState("1/4");
  const [allowance, setAllowance] = useState("1/16");
  const [rabbetDepth, setRabbetDepth] = useState("1/4");
  const [faceDepth, setFaceDepth] = useState("3/4");
  const [mode, setMode] = useState<Mode>("fraction");
  const [view, setView] = useState<View>("front");

  const gw = parseInput(glassW);
  const gh = parseInput(glassH);
  const mw = parseInput(molding);
  const rw = parseInput(rabbet);
  const alRaw = parseInput(allowance);
  const al = isNaN(alRaw) ? 0 : alRaw;
  const rd = parseInput(rabbetDepth);
  const fd = parseInput(faceDepth);

  const valid =
    !isNaN(gw) &&
    !isNaN(gh) &&
    !isNaN(mw) &&
    !isNaN(rw) &&
    !isNaN(rd) &&
    !isNaN(fd) &&
    gw > 0 &&
    gh > 0 &&
    mw > 0 &&
    rw > 0 &&
    rd > 0 &&
    fd > 0 &&
    mw > rw &&
    fd > rd;

  const wShort = Math.min(gw, gh);
  const wLong = Math.max(gw, gh);
  const overhang = mw - rw;

  const outerShort = wShort + 2 * overhang + 2 * al;
  const outerLong = wLong + 2 * overhang + 2 * al;
  const innerShort = outerShort - 2 * mw;
  const innerLong = outerLong - 2 * mw;
  const rabbetShort = wShort + 2 * al;
  const rabbetLong = wLong + 2 * al;

  const fmt = makeFmt(mode, valid);

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
      <div className="mx-auto max-w-[720px] lg:max-w-5xl">
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

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <div>

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
            <Field
              label="Face depth"
              value={faceDepth}
              onChange={setFaceDepth}
            />
          </div>
          <div className="mt-[10px] flex gap-[10px]">
            <Field label="Rabbet width" value={rabbet} onChange={setRabbet} />
            <Field
              label="Rabbet depth"
              value={rabbetDepth}
              onChange={setRabbetDepth}
            />
          </div>
          <div className="mt-[6px] font-display text-[12px] italic text-ink-soft">
            Face dims describe the molding stock; rabbet dims describe the
            L-shaped recess cut into its back-inner corner.
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

        <ModeToggle mode={mode} setMode={setMode} />

        <section className="relative mb-[22px] border border-ink bg-paper-deep p-[18px]">
          <div className="mb-[14px] font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Cut Lengths · long point to long point
          </div>
          <div className="grid grid-cols-2 gap-[14px]">
            <ResultBlock label="Short pieces (×2)" value={fmt(outerShort)} />
            <ResultBlock label="Long pieces (×2)" value={fmt(outerLong)} />
          </div>
        </section>

          </div>

        <section className="mb-[22px] lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              Frame Layout
            </div>
            <div className="flex w-fit border border-ink">
              {(["front", "rabbet"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={
                    "cursor-pointer border-none px-[10px] py-[4px] font-mono text-[10px] uppercase tracking-[0.1em] " +
                    (view === v
                      ? "bg-ink text-paper"
                      : "bg-transparent text-ink")
                  }
                >
                  {v === "front" ? "Front" : "Rabbet"}
                </button>
              ))}
            </div>
          </div>
          <div className="border border-rule bg-white p-[12px]">
            {view === "front" ? (
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
            ) : (
              <>
                <RabbetCrossSection
                  mw={mw}
                  rw={rw}
                  rd={rd}
                  fd={fd}
                  valid={valid}
                  fmt={fmt}
                />
                <div className="mt-3 border-t border-rule pt-3">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                    Table Saw Cuts · two passes
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      {
                        title: "Cut 01 · Inner wall",
                        blade: fmt(rd),
                        fence: fmt(mw - rw),
                        setup: "Flat · face down · outer edge to fence",
                      },
                      {
                        title: "Cut 02 · Shelf",
                        blade: fmt(rw),
                        fence: fmt(rd),
                        setup: "On outer edge · back to fence",
                      },
                    ].map((c) => (
                      <div key={c.title}>
                        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                          {c.title}
                        </div>
                        <div className="flex justify-between font-mono text-[12px]">
                          <span className="text-ink-soft">Blade height</span>
                          <span className="font-medium">{c.blade}</span>
                        </div>
                        <div className="flex justify-between font-mono text-[12px]">
                          <span className="text-ink-soft">Fence distance</span>
                          <span className="font-medium">{c.fence}</span>
                        </div>
                        <div className="mt-2 font-display text-[11px] italic leading-snug text-ink-soft">
                          {c.setup}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
        </div>

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

function RabbetCrossSection({
  mw,
  rw,
  rd,
  fd,
  valid,
  fmt,
}: {
  mw: number;
  rw: number;
  rd: number;
  fd: number;
  valid: boolean;
  fmt: (v: number) => string;
}) {
  const vbW = 400;
  const moldingW = 220;
  const padTop = 50;
  const padBottom = 70;
  const rawT = valid && mw > 0 && fd > 0 ? (moldingW * fd) / mw : 100;
  const moldingT = Math.max(60, Math.min(200, rawT));
  const vbH = padTop + moldingT + padBottom;
  const left = 60;
  const top = padTop;
  const right = left + moldingW;
  const bottom = top + moldingT;
  const lipRatio = valid && mw > 0 ? rw / mw : 0.25;
  const lipW = moldingW * lipRatio;
  const depthRatio = valid && fd > 0 ? rd / fd : 0.55;
  const rabbetD = moldingT * depthRatio;
  const rabbetTop = bottom - rabbetD;
  const rabbetLeft = right - lipW;
  const glassExtend = 80;
  const glassThick = 4;
  const glassLeft = rabbetLeft + 2;
  const glassTop = rabbetTop + 3;
  const path =
    `M ${left} ${top} ` +
    `L ${right} ${top} ` +
    `L ${right} ${rabbetTop} ` +
    `L ${rabbetLeft} ${rabbetTop} ` +
    `L ${rabbetLeft} ${bottom} ` +
    `L ${left} ${bottom} Z`;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="block h-auto w-full max-h-[460px]"
    >
      <defs>
        <pattern
          id="hatch-rabbet"
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
        d={path}
        fill="url(#hatch-rabbet)"
        className="stroke-ink"
        strokeWidth="1.6"
      />

      <rect
        x={glassLeft}
        y={glassTop}
        width={right + glassExtend - glassLeft}
        height={glassThick}
        className="fill-accent"
      />

      <text
        x={left + moldingW / 2}
        y={top - 14}
        textAnchor="middle"
        fontSize="12"
        fontWeight="500"
        className="fill-accent font-mono"
      >
        {fmt(mw)}
      </text>
      <text
        x={left + moldingW / 2}
        y={top - 26}
        textAnchor="middle"
        fontSize="8.5"
        letterSpacing="0.12em"
        className="fill-ink-soft font-mono"
      >
        FACE WIDTH
      </text>

      <g
        transform={`translate(${left - 14}, ${top + moldingT / 2}) rotate(-90)`}
      >
        <text
          textAnchor="middle"
          fontSize="12"
          fontWeight="500"
          className="fill-accent font-mono"
        >
          {fmt(fd)}
        </text>
        <text
          y={-14}
          textAnchor="middle"
          fontSize="8.5"
          letterSpacing="0.12em"
          className="fill-ink-soft font-mono"
        >
          FACE DEPTH
        </text>
      </g>

      <text
        x={left + (moldingW - lipW) / 2}
        y={bottom + 18}
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
        className="fill-ink font-mono"
      >
        {fmt(mw - rw)}
      </text>
      <text
        x={left + (moldingW - lipW) / 2}
        y={bottom + 32}
        textAnchor="middle"
        fontSize="8.5"
        letterSpacing="0.12em"
        className="fill-ink-soft font-mono"
      >
        OVERHANG
      </text>

      <text
        x={rabbetLeft + lipW / 2}
        y={bottom + 18}
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
        className="fill-accent font-mono"
      >
        {fmt(rw)}
      </text>
      <text
        x={rabbetLeft + lipW / 2}
        y={bottom + 32}
        textAnchor="middle"
        fontSize="8.5"
        letterSpacing="0.12em"
        className="fill-ink-soft font-mono"
      >
        RABBET
      </text>

      <text
        x={right + glassExtend / 2 + 10}
        y={glassTop + glassThick + 16}
        textAnchor="middle"
        fontSize="9"
        letterSpacing="0.12em"
        className="fill-accent font-mono"
      >
        GLASS →
      </text>

      <text
        x={left + moldingW / 2}
        y={bottom + 56}
        textAnchor="middle"
        fontSize="11"
        fontStyle="italic"
        className="fill-ink-soft font-display"
      >
        (cross-section through one molding piece)
      </text>
    </svg>
  );
}
