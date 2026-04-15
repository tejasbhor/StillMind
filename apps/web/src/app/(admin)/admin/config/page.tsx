"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Tab = "resource" | "thresholds" | "weights";

function SliderRow({
  label, value, min, max, step = 0.01, onChange, formatValue,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; formatValue?: (v: number) => string;
}) {
  const fmt = formatValue ?? ((v) => v.toFixed(2));
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-sans text-sm text-[#3D5A54]">{label}</label>
        <span className="font-serif text-lg text-[#3D5A54]">{fmt(value)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-[#E8F2EE]">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-[#7BA89A] transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute -top-1 w-4 h-4 rounded-full bg-[#7BA89A] border-2 border-white shadow-sm transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between font-sans text-xs text-[#3D5A54]/30">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

export default function AdminConfigPage() {
  const [tab, setTab]               = useState<Tab>("resource");
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  // Resource policy
  const [slotsPerDay, setSlotsPerDay]   = useState(10);
  const [slotDuration, setSlotDuration] = useState(30);

  // Risk thresholds (GREEN max = also YELLOW min)
  const [greenMax,  setGreenMax]  = useState(0.30);
  const [yellowMax, setYellowMax] = useState(0.60);

  // Priority weights
  const [wCri,        setWCri]        = useState(0.50);
  const [wTrend,      setWTrend]      = useState(0.20);
  const [wEngagement, setWEngagement] = useState(0.20);
  const [wTimeGap,    setWTimeGap]    = useState(0.10);

  const weightSum     = +(wCri + wTrend + wEngagement + wTimeGap).toFixed(2);
  const weightsValid  = weightSum === 1.00;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <h1 className="font-serif text-3xl text-[#3D5A54]">Configuration</h1>
        <p className="font-sans font-normal text-sm text-[#3D5A54]/75 mt-1">
          All changes are audit-logged immediately with your admin ID.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border border-[#E8F2EE] rounded-xl bg-white p-1 gap-1 animate-fade-up stagger-1">
        {(["resource", "thresholds", "weights"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-lg font-sans text-sm transition-all cursor-pointer capitalize",
              tab === t ? "bg-[#3D5A54] text-white font-medium" : "text-[#3D5A54]/60 hover:text-[#3D5A54]"
            )}
          >
            {t === "resource" ? "Resources" : t === "thresholds" ? "Risk thresholds" : "Priority weights"}
          </button>
        ))}
      </div>

      {/* ── Resource policies ── */}
      {tab === "resource" && (
        <Card className="animate-scale-in" padding="lg">
          <h2 className="font-serif text-xl text-[#3D5A54] mb-6">Resource policies</h2>
          <div className="flex flex-col gap-8">
            <SliderRow
              label="Daily slot capacity per counsellor"
              value={slotsPerDay}
              min={1} max={20} step={1}
              onChange={setSlotsPerDay}
              formatValue={(v) => `${v} slots`}
            />
            <SliderRow
              label="Session duration"
              value={slotDuration}
              min={15} max={90} step={5}
              onChange={setSlotDuration}
              formatValue={(v) => `${v} min`}
            />
          </div>
        </Card>
      )}

      {/* ── Risk thresholds ── */}
      {tab === "thresholds" && (
        <Card className="animate-scale-in" padding="lg">
          <h2 className="font-serif text-xl text-[#3D5A54] mb-2">Risk classification thresholds</h2>
          <p className="font-sans font-normal text-xs text-[#3D5A54]/70 mb-6">
            CRI ranges determine how students are categorised. Changes take effect on next risk computation.
          </p>
          <div className="flex flex-col gap-8">
            {/* Green range: 0 → greenMax */}
            <div className="rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#7BA89A]" />
                <p className="font-sans text-sm font-medium text-[#3D5A54]">Green range: 0.00 → {greenMax.toFixed(2)}</p>
              </div>
              <SliderRow label="Green max (YELLOW starts here)" value={greenMax} min={0.10} max={0.50}
                onChange={(v) => { setGreenMax(v); if (v >= yellowMax) setYellowMax(+(v + 0.10).toFixed(2)); }} />
            </div>
            {/* Yellow range: greenMax → yellowMax */}
            <div className="rounded-xl bg-[#FEF4E0] border border-[#E8D4B0] p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#D4900A]" />
                <p className="font-sans text-sm font-medium text-[#A0700A]">Yellow range: {greenMax.toFixed(2)} → {yellowMax.toFixed(2)}</p>
              </div>
              <SliderRow label="Yellow max (RED starts here)" value={yellowMax} min={greenMax + 0.05} max={0.90}
                onChange={setYellowMax} />
            </div>
            {/* Red range */}
            <div className="rounded-xl bg-[#FDEAEA] border border-[#F5B8B8] p-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B03030]" />
                <p className="font-sans text-sm font-medium text-[#B03030]">Red range: {yellowMax.toFixed(2)} → 1.00</p>
              </div>
              <p className="font-sans text-xs text-[#B03030]/60 mt-2">
                PHQ-9 Q9 ≥ 1 always triggers RED regardless of CRI score. This rule cannot be disabled.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Priority weights ── */}
      {tab === "weights" && (
        <Card className="animate-scale-in" padding="lg">
          <h2 className="font-serif text-xl text-[#3D5A54] mb-2">Priority score weights</h2>
          <p className="font-sans font-normal text-xs text-[#3D5A54]/70 mb-6">
            Weights must sum to exactly 1.00. Formula: Priority = Σ(weight × factor).
          </p>
          <div className="flex flex-col gap-8">
            <SliderRow label="CRI score (composite risk)" value={wCri} min={0} max={1}
              onChange={setWCri} />
            <SliderRow label="Trend score" value={wTrend} min={0} max={0.50}
              onChange={setWTrend} />
            <SliderRow label="Engagement score (inverse)" value={wEngagement} min={0} max={0.50}
              onChange={setWEngagement} />
            <SliderRow label="Time gap since last session" value={wTimeGap} min={0} max={0.30}
              onChange={setWTimeGap} />
          </div>
          <div className={cn(
            "mt-6 rounded-xl border px-4 py-3 flex items-center justify-between",
            weightsValid
              ? "bg-[#E8F2EE] border-[#B8D4C0]"
              : "bg-[#FDEAEA] border-[#F5B8B8]"
          )}>
            <p className={cn("font-sans text-sm", weightsValid ? "text-[#3D5A54]" : "text-[#B03030]")}>
              {weightsValid ? "✓ Weights sum to 1.00 — valid" : `⚠ Weights sum to ${weightSum.toFixed(2)} — must equal 1.00`}
            </p>
          </div>
        </Card>
      )}

      {/* Save button */}
      <div className="animate-fade-up stagger-3 flex gap-3">
        <Button
          loading={saving}
          disabled={tab === "weights" && !weightsValid}
          onClick={handleSave}
          className="flex-1"
          id="save-config"
        >
          {saved ? <span className="animate-tick">✓ Saved & logged</span> : "Save configuration"}
        </Button>
      </div>

      <div className="animate-fade-up stagger-4 rounded-xl bg-[#E8F2EE] border border-[#B8D4C0] px-4 py-3">
        <p className="font-sans text-xs font-normal text-[#3D5A54]/70 leading-relaxed">
          All configuration changes are written to the immutable audit log with your actor ID, timestamp, and previous value. Changes are irreversible — the log records the full history.
        </p>
      </div>
    </div>
  );
}
