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
  toFractionInput,
  type Mode,
} from "../_components/shared";

function bottomWeightFor(vTotal: number): number {
  if (vTotal > 12) return 1;
  if (vTotal > 8) return 0.75;
  if (vTotal > 4) return 0.5;
  return 0.25;
}

function bestFitBorders(
  ow: number,
  oh: number,
  aw: number,
  ah: number,
  rev: number,
  bottomWeight: boolean,
): { top: number; bottom: number; left: number; right: number } | null {
  const winW = aw - 2 * rev;
  const winH = ah - 2 * rev;
  const hTotal = ow - winW;
  const vTotal = oh - winH;
  if (winW <= 0 || winH <= 0 || hTotal <= 0 || vTotal <= 0) return null;
  const weight = bottomWeight
    ? Math.min(bottomWeightFor(vTotal), vTotal)
    : 0;
  const left = hTotal / 2;
  const right = hTotal / 2;
  const top = (vTotal - weight) / 2;
  const bottom = (vTotal + weight) / 2;
  return { top, bottom, left, right };
}

type Preset = { label: string; w: number; h: number };

const PRESETS: readonly Preset[] = [
  { label: "8×10", w: 8, h: 10 },
  { label: "11×14", w: 11, h: 14 },
  { label: "16×20", w: 16, h: 20 },
  { label: "18×24", w: 18, h: 24 },
  { label: "20×24", w: 20, h: 24 },
  { label: "24×30", w: 24, h: 30 },
];

export default function MatCalculator() {
  const [outerW, setOuterW] = useState("16");
  const [outerH, setOuterH] = useState("20");
  const [borderTop, setBorderTop] = useState("3");
  const [borderBottom, setBorderBottom] = useState("3 1/2");
  const [borderLeft, setBorderLeft] = useState("2 3/4");
  const [borderRight, setBorderRight] = useState("2 3/4");
  const [artW, setArtW] = useState("11");
  const [artH, setArtH] = useState("14");
  const [reveal, setReveal] = useState("1/4");
  const [bottomWeight, setBottomWeight] = useState(true);
  const [mode, setMode] = useState<Mode>("fraction");

  const ow = parseInput(outerW);
  const oh = parseInput(outerH);
  const bt = parseInput(borderTop);
  const bb = parseInput(borderBottom);
  const bl = parseInput(borderLeft);
  const br = parseInput(borderRight);
  const aw = parseInput(artW);
  const ah = parseInput(artH);
  const rev = parseInput(reveal);
  const revVal = isNaN(rev) ? 0 : rev;

  const bordersValid =
    !isNaN(bt) && !isNaN(bb) && !isNaN(bl) && !isNaN(br) &&
    bt >= 0 && bb >= 0 && bl >= 0 && br >= 0;
  const outerValid = !isNaN(ow) && !isNaN(oh) && ow > 0 && oh > 0;
  const windowW = ow - bl - br;
  const windowH = oh - bt - bb;
  const valid =
    outerValid &&
    bordersValid &&
    windowW > 0 &&
    windowH > 0;

  const fmt = makeFmt(mode, valid);

  const artValid = !isNaN(aw) && !isNaN(ah) && aw > 0 && ah > 0;
  const revealMode = artValid;
  const bestFitPreview =
    artValid && outerValid
      ? bestFitBorders(ow, oh, aw, ah, revVal, bottomWeight)
      : null;
  const targetWindowW = revealMode ? aw - 2 * revVal : windowW;
  const targetWindowH = revealMode ? ah - 2 * revVal : windowH;
  const windowMismatchW = revealMode ? windowW - targetWindowW : 0;
  const windowMismatchH = revealMode ? windowH - targetWindowH : 0;

  const overlapLeft = revealMode ? (aw - windowW) / 2 : NaN;
  const overlapTop = revealMode ? (ah - windowH) / 2 : NaN;

  const vbW = 400;
  const pad = 48;
  const drawW = vbW - 2 * pad;
  const aspect = valid && ow > 0 ? oh / ow : 1.25;
  const drawH = drawW * aspect;
  const vbH = drawH + 2 * pad;
  const pxPerInch = valid ? drawW / ow : 0;
  const winLeft = pad + bl * pxPerInch;
  const winTop = pad + bt * pxPerInch;
  const winWpx = windowW * pxPerInch;
  const winHpx = windowH * pxPerInch;
  const artLeftPx = revealMode && valid ? pad + (ow - aw) / 2 * pxPerInch : 0;
  const artTopPx = revealMode && valid ? pad + (oh - ah) / 2 * pxPerInch : 0;
  const artWpx = revealMode ? aw * pxPerInch : 0;
  const artHpx = revealMode ? ah * pxPerInch : 0;

  return (
    <main className="px-[14px] pt-6 pb-[60px]">
      <div className="mx-auto max-w-[720px] lg:max-w-5xl">
        <header className="mb-[22px] border-b-2 border-ink pb-[14px]">
          <div className="mb-[6px] font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Shop Reference · Mat Cutting
          </div>
          <h1 className="m-0 font-display text-[clamp(28px,7vw,38px)] font-medium leading-[1.05] tracking-[-0.02em]">
            Mat Cut Calculator
          </h1>
          <div className="mt-1 font-display text-[15px] italic text-ink-soft">
            for single-window mats with independent borders
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <div>
            <FieldGroup label="01 · Outer mat dimensions">
              <div className="mb-[10px] flex gap-[10px]">
                <Field label="Width" value={outerW} onChange={setOuterW} />
                <Field label="Height" value={outerH} onChange={setOuterH} />
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {PRESETS.map((p) => {
                  const active =
                    parseInput(outerW) === p.w && parseInput(outerH) === p.h;
                  return (
                    <button
                      key={p.label}
                      onClick={() => {
                        setOuterW(String(p.w));
                        setOuterH(String(p.h));
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
              <div className="mt-[6px] font-display text-[12px] italic text-ink-soft">
                Usually matches the frame&rsquo;s rabbet opening.
              </div>
            </FieldGroup>

            <FieldGroup label="02 · Borders (per side)">
              <div className="mb-[10px] flex gap-[10px]">
                <Field label="Top" value={borderTop} onChange={setBorderTop} />
                <Field
                  label="Bottom"
                  value={borderBottom}
                  onChange={setBorderBottom}
                />
              </div>
              <div className="flex gap-[10px]">
                <Field label="Left" value={borderLeft} onChange={setBorderLeft} />
                <Field
                  label="Right"
                  value={borderRight}
                  onChange={setBorderRight}
                />
              </div>
              <div className="mt-[6px] font-display text-[12px] italic text-ink-soft">
                Bottom-weighted (slightly larger bottom border) reads better on
                vertical art.
              </div>
            </FieldGroup>

            <FieldGroup label="03 · Artwork & best fit">
              <div className="mb-[10px] flex gap-[10px]">
                <Field label="Art width" value={artW} onChange={setArtW} />
                <Field label="Art height" value={artH} onChange={setArtH} />
              </div>
              <Field
                label="Reveal (overlap onto art, per side)"
                value={reveal}
                onChange={setReveal}
                full
              />
              <div className="mt-[10px] flex flex-wrap items-start justify-between gap-[10px]">
                <div className="flex flex-col gap-[8px]">
                  <button
                    type="button"
                    onClick={() => {
                      const fit = bestFitBorders(
                        ow,
                        oh,
                        aw,
                        ah,
                        revVal,
                        bottomWeight,
                      );
                      if (!fit) return;
                      setBorderTop(toFractionInput(fit.top));
                      setBorderBottom(toFractionInput(fit.bottom));
                      setBorderLeft(toFractionInput(fit.left));
                      setBorderRight(toFractionInput(fit.right));
                    }}
                    disabled={!bestFitPreview}
                    className={
                      "cursor-pointer rounded-none border border-ink bg-ink px-[14px] py-[8px] font-mono text-[11px] uppercase tracking-[0.1em] text-paper " +
                      "disabled:cursor-not-allowed disabled:border-rule disabled:bg-transparent disabled:text-ink-soft"
                    }
                  >
                    Best fit borders →
                  </button>
                  <label className="flex cursor-pointer items-center gap-[6px] font-mono text-[11px] text-ink-soft">
                    <input
                      type="checkbox"
                      checked={bottomWeight}
                      onChange={(e) => setBottomWeight(e.target.checked)}
                      className="h-[14px] w-[14px] cursor-pointer accent-ink"
                    />
                    Bottom-weight (optical center)
                  </label>
                </div>
                <div className="font-display text-[12px] italic leading-snug text-ink-soft">
                  Use whole board as outer, center the artwork, and
                  {bottomWeight
                    ? " bottom-weight the top/bottom split for optical center."
                    : " split top/bottom evenly."}
                </div>
              </div>
              {bestFitPreview && (
                <div className="mt-[8px] font-mono text-[11px] text-ink-soft">
                  Would set borders to {toFractionInput(bestFitPreview.top)}&Prime; T
                  · {toFractionInput(bestFitPreview.bottom)}&Prime; B
                  · {toFractionInput(bestFitPreview.left)}&Prime; L
                  · {toFractionInput(bestFitPreview.right)}&Prime; R
                </div>
              )}
            </FieldGroup>

            {!valid && (
              <div className="mb-[18px] border border-accent bg-accent-soft px-[14px] py-[10px] font-sans text-[13px] text-accent">
                Check inputs. Outer must be positive and borders must leave a
                window larger than zero on both axes.
              </div>
            )}

            {valid && revealMode && (Math.abs(windowMismatchW) > 1e-3 || Math.abs(windowMismatchH) > 1e-3) && (
              <div className="mb-[18px] border border-accent bg-accent-soft px-[14px] py-[10px] font-sans text-[13px] text-accent">
                Window doesn&rsquo;t match a {fmt(revVal)} reveal. Actual overlap:{" "}
                {fmt(overlapLeft)} L/R · {fmt(overlapTop)} T/B.
              </div>
            )}

            <ModeToggle mode={mode} setMode={setMode} />

            <section className="relative mb-[22px] border border-ink bg-paper-deep p-[18px]">
              <div className="mb-[14px] font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Window Opening · short point to short point
              </div>
              <div className="grid grid-cols-2 gap-[14px]">
                <ResultBlock label="Width" value={fmt(windowW)} />
                <ResultBlock label="Height" value={fmt(windowH)} />
              </div>
            </section>
          </div>

          <section className="mb-[22px] lg:sticky lg:top-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Mat Layout
              </div>
            </div>
            <div className="border border-rule bg-white p-[12px]">
              <svg
                viewBox={`0 0 ${vbW} ${vbH}`}
                className="block h-auto w-full max-h-[460px]"
              >
                <defs>
                  <pattern
                    id="hatch-mat"
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
                  <marker
                    id="arrow-end-mat"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path
                      d="M 0 0 L 10 5 L 0 10 Z"
                      className="fill-accent"
                    />
                  </marker>
                </defs>

                {revealMode && valid && (
                  <rect
                    x={artLeftPx}
                    y={artTopPx}
                    width={artWpx}
                    height={artHpx}
                    className="fill-accent-soft"
                    opacity="0.7"
                  />
                )}

                <path
                  d={`M ${pad} ${pad}
                      L ${pad + drawW} ${pad}
                      L ${pad + drawW} ${pad + drawH}
                      L ${pad} ${pad + drawH} Z
                      M ${winLeft} ${winTop}
                      L ${winLeft} ${winTop + winHpx}
                      L ${winLeft + winWpx} ${winTop + winHpx}
                      L ${winLeft + winWpx} ${winTop} Z`}
                  fill="url(#hatch-mat)"
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
                  x={winLeft}
                  y={winTop}
                  width={winWpx}
                  height={winHpx}
                  fill="none"
                  className="stroke-accent"
                  strokeWidth="1.2"
                />

                {valid && (
                  <g stroke="#e0455a" strokeWidth="2" strokeLinecap="round">
                    {[winLeft, winLeft + winWpx].map((x) => (
                      <line
                        key={`top-${x}`}
                        x1={x}
                        y1={pad - 6}
                        x2={x}
                        y2={winTop + 4}
                      />
                    ))}
                    {[winLeft, winLeft + winWpx].map((x) => (
                      <line
                        key={`bot-${x}`}
                        x1={x}
                        y1={winTop + winHpx - 4}
                        x2={x}
                        y2={pad + drawH + 6}
                      />
                    ))}
                    {[winTop, winTop + winHpx].map((y) => (
                      <line
                        key={`left-${y}`}
                        x1={pad - 6}
                        y1={y}
                        x2={winLeft + 4}
                        y2={y}
                      />
                    ))}
                    {[winTop, winTop + winHpx].map((y) => (
                      <line
                        key={`right-${y}`}
                        x1={winLeft + winWpx - 4}
                        y1={y}
                        x2={pad + drawW + 6}
                        y2={y}
                      />
                    ))}
                  </g>
                )}

                <text
                  x={pad + drawW / 2}
                  y={pad - 14}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  className="fill-accent font-mono"
                >
                  {fmt(ow)}
                </text>
                <text
                  x={pad + drawW / 2}
                  y={pad - 26}
                  textAnchor="middle"
                  fontSize="8.5"
                  letterSpacing="0.12em"
                  className="fill-ink-soft font-mono"
                >
                  OUTER WIDTH
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
                    {fmt(oh)}
                  </text>
                  <text
                    textAnchor="middle"
                    fontSize="8.5"
                    letterSpacing="0.12em"
                    y={-14}
                    className="fill-ink-soft font-mono"
                  >
                    OUTER HEIGHT
                  </text>
                </g>

                {valid && (() => {
                  const labelW = 44;
                  const labelH = 14;
                  const winCx = winLeft + winWpx / 2;
                  const winCy = winTop + winHpx / 2;
                  const topCy = (pad + winTop) / 2;
                  const botCy = (winTop + winHpx + pad + drawH) / 2;
                  const leftCx = (pad + winLeft) / 2;
                  const rightCx = (winLeft + winWpx + pad + drawW) / 2;
                  const arrows = [
                    {
                      key: "top",
                      line: { x1: winCx, y1: pad + 2, x2: winCx, y2: winTop - 2 },
                      tx: winCx,
                      ty: topCy,
                      value: fmt(bt),
                    },
                    {
                      key: "bot",
                      line: {
                        x1: winCx,
                        y1: winTop + winHpx + 2,
                        x2: winCx,
                        y2: pad + drawH - 2,
                      },
                      tx: winCx,
                      ty: botCy,
                      value: fmt(bb),
                    },
                    {
                      key: "left",
                      line: { x1: pad + 2, y1: winCy, x2: winLeft - 2, y2: winCy },
                      tx: leftCx,
                      ty: winCy,
                      value: fmt(bl),
                    },
                    {
                      key: "right",
                      line: {
                        x1: winLeft + winWpx + 2,
                        y1: winCy,
                        x2: pad + drawW - 2,
                        y2: winCy,
                      },
                      tx: rightCx,
                      ty: winCy,
                      value: fmt(br),
                    },
                  ];
                  return (
                    <g>
                      {arrows.map((a) => (
                        <line
                          key={`l-${a.key}`}
                          x1={a.line.x1}
                          y1={a.line.y1}
                          x2={a.line.x2}
                          y2={a.line.y2}
                          className="stroke-accent"
                          strokeWidth="0.9"
                          markerStart="url(#arrow-end-mat)"
                          markerEnd="url(#arrow-end-mat)"
                        />
                      ))}
                      {arrows.map((a) => (
                        <rect
                          key={`r-${a.key}`}
                          x={a.tx - labelW / 2}
                          y={a.ty - labelH / 2}
                          width={labelW}
                          height={labelH}
                          fill="white"
                        />
                      ))}
                      {arrows.map((a) => (
                        <text
                          key={`t-${a.key}`}
                          x={a.tx}
                          y={a.ty}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fontWeight="500"
                          className="fill-accent font-mono"
                        >
                          {a.value}
                        </text>
                      ))}
                    </g>
                  );
                })()}

                <text
                  x={winLeft + winWpx / 2}
                  y={winTop + winHpx / 2 - 4}
                  textAnchor="middle"
                  fontSize="9"
                  letterSpacing="0.18em"
                  className="fill-ink-soft font-mono"
                >
                  WINDOW
                </text>
                <text
                  x={winLeft + winWpx / 2}
                  y={winTop + winHpx / 2 + 12}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  className="fill-accent font-mono"
                >
                  {fmt(windowW)} × {fmt(windowH)}
                </text>
              </svg>
            </div>
          </section>
        </div>

        <section className="mb-6">
          <SectionLabel>Cutter Guide-Bar Settings</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                title: "Cut 01 · Top window edge",
                stop: fmt(bt),
                from: fmt(bl),
                to: fmt(ow - br),
                setup: "Face down · top edge against guide bar",
              },
              {
                title: "Cut 02 · Bottom window edge",
                stop: fmt(bb),
                from: fmt(bl),
                to: fmt(ow - br),
                setup: "Face down · bottom edge against guide bar",
              },
              {
                title: "Cut 03 · Left window edge",
                stop: fmt(bl),
                from: fmt(bt),
                to: fmt(oh - bb),
                setup: "Face down · left edge against guide bar",
              },
              {
                title: "Cut 04 · Right window edge",
                stop: fmt(br),
                from: fmt(bt),
                to: fmt(oh - bb),
                setup: "Face down · right edge against guide bar",
              },
            ].map((c) => (
              <div key={c.title} className="border border-rule bg-paper-deep p-[14px]">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  {c.title}
                </div>
                <div className="flex justify-between font-mono text-[12px]">
                  <span className="text-ink-soft">Guide bar offset</span>
                  <span className="font-medium">{c.stop}</span>
                </div>
                <div className="flex justify-between font-mono text-[12px]">
                  <span className="text-ink-soft">Plunge at</span>
                  <span className="font-medium">{c.from}</span>
                </div>
                <div className="flex justify-between font-mono text-[12px]">
                  <span className="text-ink-soft">Stop at</span>
                  <span className="font-medium">{c.to}</span>
                </div>
                <div className="mt-2 font-display text-[11px] italic leading-snug text-ink-soft">
                  {c.setup}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <SectionLabel>All Dimensions</SectionLabel>
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {(
                [
                  [
                    "Outer mat",
                    `${fmt(ow)} × ${fmt(oh)}`,
                    "matches frame rabbet",
                  ],
                  [
                    "Window (sight opening)",
                    `${fmt(windowW)} × ${fmt(windowH)}`,
                    "cut from the face side, short point to short point",
                  ],
                  [
                    "Borders",
                    `${fmt(bt)} top · ${fmt(bb)} bot · ${fmt(bl)} L · ${fmt(br)} R`,
                    "distance from outer edge to window edge",
                  ],
                  ...(revealMode
                    ? ([
                        [
                          "Artwork",
                          `${fmt(aw)} × ${fmt(ah)}`,
                          "as specified",
                        ],
                        [
                          "Actual reveal",
                          `${fmt(overlapLeft)} L/R · ${fmt(overlapTop)} T/B`,
                          "mat coverage onto the artwork edge",
                        ],
                      ] as const)
                    : []),
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
              Cut the mat face down. Guide-bar offset is the border for the
              edge you set against the bar.
            </li>
            <li>
              Plunge and stop positions are measured along the cut, from the
              perpendicular outer edge.
            </li>
            <li>
              For a beveled cutter, overshoot each plunge/stop slightly to
              account for the bevel reach — verify on a scrap first.
            </li>
            <li>
              Inputs accept decimals like 1.5, or fractions like 1 1/2 or 1/4.
            </li>
            <li>
              Reveal (overlap onto artwork) is typically 1/8&Prime; to 1/4&Prime;
              per side so the mat hides the paper edge.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
