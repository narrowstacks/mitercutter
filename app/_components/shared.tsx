import type { ReactNode } from "react";

export type Mode = "fraction" | "decimal";

export function parseInput(str: string | number): number {
  if (typeof str === "number") return str;
  if (str === "" || str == null) return NaN;
  const s = String(str).trim();
  const m1 = s.match(/^(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)$/);
  if (m1) return parseFloat(m1[1]) + parseInt(m1[2]) / parseInt(m1[3]);
  const m2 = s.match(/^(\d+)\/(\d+)$/);
  if (m2) return parseInt(m2[1]) / parseInt(m2[2]);
  return parseFloat(s);
}

export function toFraction(decimal: number, denom = 16): string {
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

export function toFractionInput(decimal: number, denom = 16): string {
  return toFraction(decimal, denom).replace(/"$/, "");
}

export function makeFmt(mode: Mode, valid: boolean) {
  return (v: number): string => {
    if (!valid || isNaN(v)) return "· · ·";
    return mode === "fraction" ? toFraction(v) : `${v.toFixed(3)}"`;
  };
}

export function FieldGroup({
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

export function Field({
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

export function ResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 font-sans text-[12px] text-ink-soft">{label}</div>
      <div className="font-mono text-[clamp(22px,7vw,34px)] font-medium leading-none tracking-[-0.01em] text-accent">
        {value}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
      {children}
    </div>
  );
}

export function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
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
  );
}
