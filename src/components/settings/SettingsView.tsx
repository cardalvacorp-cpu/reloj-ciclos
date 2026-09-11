import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { CoinSpec } from "@/lib/coins/catalog";
import type { Copy } from "@/lib/i18n";
import type { Snapshot } from "@/lib/cycle/model";
import type { ExtremeMark } from "@/lib/cycle/model";
import { formatUsdCompact, type Lang } from "@/lib/cycle/time";
import { cn } from "@/lib/utils";
import { TipSettings } from "@/components/tips/TipJar";

function athSlider(ath: number): { min: number; max: number; step: number } {
  if (ath >= 10_000) {
    return { min: Math.round(ath * 0.25), max: Math.round(ath * 2.2), step: 50 };
  }
  if (ath >= 100) {
    return { min: Math.round(ath * 0.15), max: Math.round(ath * 3), step: 1 };
  }
  if (ath >= 1) {
    return {
      min: Math.max(0.05, Number((ath * 0.12).toFixed(2))),
      max: Number((ath * 4).toFixed(2)),
      step: 0.01,
    };
  }
  return {
    min: Math.max(0.0001, Number((ath * 0.08).toFixed(5))),
    max: Number((ath * 5).toFixed(5)),
    step: 0.0001,
  };
}

const ZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Bogota",
  "UTC",
  "Europe/Madrid",
  "Europe/London",
  "Asia/Tokyo",
];

export function SettingsView({
  lang,
  copy,
  snap,
  tz,
  athLocal,
  athUsd,
  upDays,
  downDays,
  lowMild,
  lowBaseLo,
  lowBaseHi,
  lowSevLo,
  lowSevHi,
  showRanges,
  muteRedBox,
  notifications,
  whalePrint,
  whaleCluster,
  volAggressive,
  volExtreme,
  onLang,
  onPatch,
  onPreset,
  onReset,
  onMarkLow,
  onMarkHigh,
  onNoAnalog,
  onToggle,
  onExportJson,
  onExportCsv,
  onImport,
  coin,
}: {
  lang: Lang;
  copy: Copy;
  snap: Snapshot;
  tz: string;
  athLocal: string;
  athUsd: number;
  upDays: number;
  downDays: number;
  lowMild: number;
  lowBaseLo: number;
  lowBaseHi: number;
  lowSevLo: number;
  lowSevHi: number;
  showRanges: boolean;
  muteRedBox: boolean;
  notifications: boolean;
  whalePrint: number;
  whaleCluster: number;
  volAggressive: number;
  volExtreme: number;
  onLang: (l: Lang) => void;
  onPatch: (p: Record<string, unknown>) => void;
  onPreset: (id: "my_base" | "exact_down" | "prior_down" | "c3_real") => void;
  onReset: () => void;
  onMarkLow: (m: ExtremeMark) => void;
  onMarkHigh: (m: ExtremeMark) => void;
  onNoAnalog: () => void;
  onToggle: (k: "showRanges" | "muteRedBox" | "notifications", v: boolean) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImport: (data: Record<string, unknown>) => void;
  coin: CoinSpec;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [lowForm, setLowForm] = useState(false);
  const [highForm, setHighForm] = useState(false);
  const [lowLocal, setLowLocal] = useState("2026-10-05T00:00");
  const [lowPx, setLowPx] = useState("32000");
  const [highLocal, setHighLocal] = useState(athLocal);
  const [highPx, setHighPx] = useState(String(athUsd));

  const athSlide = athSlider(coin.defaultModel.athUsd);
  const upMin = Math.max(80, Math.round(coin.defaultModel.upDays * 0.4));
  const upMax = Math.max(upMin + 80, Math.round(coin.defaultModel.upDays * 1.7));
  const downMin = Math.max(60, Math.round(coin.defaultModel.downDays * 0.4));
  const downMax = Math.max(downMin + 40, Math.round(coin.defaultModel.downDays * 1.7));
  const genesis = coin.frozen[0]?.start ?? "—";


  return (
    <div className="flex flex-col gap-6 pb-10">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-cream">{copy.lang}</h2>
        <div className="flex gap-2">
          <LangBtn on={lang === "es"} onClick={() => onLang("es")} label="ES" />
          <LangBtn on={lang === "en"} onClick={() => onLang("en")} label="EN" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-cream">{copy.lab}</h2>
        <p className="text-sm text-cream-muted">{copy.whyThese}</p>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" onClick={() => onPreset("my_base")}>
            {copy.myBase}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onPreset("exact_down")}>
            {copy.presetDown}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onPreset("prior_down")}>
            {copy.presetPrior}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onPreset("c3_real")}>
            {copy.presetC3up}
          </Button>
        </div>

        <Field label={copy.tz}>
          <select
            className="min-h-11 w-full rounded-md border border-line bg-navy-elevated px-3 text-sm text-cream"
            value={tz}
            onChange={(e) => onPatch({ tz: e.target.value })}
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`${copy.athDate}`}>
          <input
            type="datetime-local"
            className="min-h-11 w-full rounded-md border border-line bg-navy-elevated px-3 text-sm text-cream"
            value={athLocal}
            onChange={(e) => onPatch({ athLocal: e.target.value })}
          />
        </Field>

        <Field label={`${copy.athUsd}: ${athUsd.toLocaleString(lang === "es" ? "es-MX" : "en-US")}`}>
          <Slider
            min={athSlide.min}
            max={athSlide.max}
            step={athSlide.step}
            value={[athUsd]}
            onValueChange={([v]) => onPatch({ athUsd: v })}
          />
        </Field>

        <Field label={`${copy.upDays}: ${upDays}`}>
          <Slider
            min={upMin}
            max={upMax}
            step={1}
            value={[upDays]}
            onValueChange={([v]) => onPatch({ upDays: v })}
          />
        </Field>

        <Field label={`${copy.downDays}: ${downDays}`}>
          <Slider
            min={downMin}
            max={downMax}
            step={1}
            value={[downDays]}
            onValueChange={([v]) => onPatch({ downDays: v })}
          />
        </Field>

        <p className="text-sm text-cream-muted">
          {copy.rangeTitle}: {formatUsdCompact(snap.ranges.sevLo, lang)}–
          {formatUsdCompact(snap.ranges.mild, lang)} · {copy.scenario}
        </p>
        <p className="text-xs text-cream-faint">
          {copy.multiples}: 3× {formatUsdCompact(snap.ranges.ceiling3, lang)} · 5×{" "}
          {formatUsdCompact(snap.ranges.ceiling5, lang)} · 8×{" "}
          {formatUsdCompact(snap.ranges.ceiling8, lang)} · 12×{" "}
          {formatUsdCompact(snap.ranges.ceiling12, lang)}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-cream">{copy.ifWrong}</h2>
        {snap.missedMap && (
          <p className="rounded-lg bg-red/20 px-3 py-2 text-sm">{copy.missedMap}</p>
        )}
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" onClick={() => setLowForm((v) => !v)}>
            {copy.markLow}
          </Button>
          {lowForm && (
            <form
              className="flex flex-col gap-2 rounded-xl bg-navy-card p-3"
              onSubmit={(e) => {
                e.preventDefault();
                onMarkLow({ local: lowLocal, price: Number(lowPx) });
                setLowForm(false);
              }}
            >
              <label className="text-xs text-cream-muted">{copy.lowDate}</label>
              <input
                type="datetime-local"
                value={lowLocal}
                onChange={(e) => setLowLocal(e.target.value)}
                className="min-h-11 rounded-md border border-line bg-navy-elevated px-3 text-sm"
              />
              <label className="text-xs text-cream-muted">{copy.lowPrice}</label>
              <input
                type="number"
                value={lowPx}
                onChange={(e) => setLowPx(e.target.value)}
                className="min-h-11 rounded-md border border-line bg-navy-elevated px-3 text-sm"
              />
              <Button type="submit">{copy.save}</Button>
            </form>
          )}
          <Button variant="outline" onClick={() => setHighForm((v) => !v)}>
            {copy.markHigh}
          </Button>
          {highForm && (
            <form
              className="flex flex-col gap-2 rounded-xl bg-navy-card p-3"
              onSubmit={(e) => {
                e.preventDefault();
                onMarkHigh({ local: highLocal, price: Number(highPx) });
                setHighForm(false);
              }}
            >
              <label className="text-xs text-cream-muted">{copy.highDate}</label>
              <input
                type="datetime-local"
                value={highLocal}
                onChange={(e) => setHighLocal(e.target.value)}
                className="min-h-11 rounded-md border border-line bg-navy-elevated px-3 text-sm"
              />
              <label className="text-xs text-cream-muted">{copy.highPrice}</label>
              <input
                type="number"
                value={highPx}
                onChange={(e) => setHighPx(e.target.value)}
                className="min-h-11 rounded-md border border-line bg-navy-elevated px-3 text-sm"
              />
              <Button type="submit">{copy.save}</Button>
            </form>
          )}
          <Button variant="danger" onClick={onNoAnalog}>
            {copy.noRhyme}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-cream">{copy.volume}</h2>
        <Field label={`${copy.whalePrint}: ${whalePrint} ${coin.symbol}`}>
          <Slider
            min={10}
            max={20}
            step={1}
            value={[whalePrint]}
            onValueChange={([v]) => onPatch({ whalePrint: v })}
          />
        </Field>
        <Field label={`${copy.whaleCluster}: ${whaleCluster} ${coin.symbol}/h`}>
          <Slider
            min={50}
            max={100}
            step={5}
            value={[whaleCluster]}
            onValueChange={([v]) => onPatch({ whaleCluster: v })}
          />
        </Field>
        <Field label={`${copy.volAggTh}: ${volAggressive}×`}>
          <Slider
            min={1.5}
            max={3}
            step={0.1}
            value={[volAggressive]}
            onValueChange={([v]) => onPatch({ volAggressive: v })}
          />
        </Field>
        <Field label={`${copy.volExtTh}: ${volExtreme}×`}>
          <Slider
            min={2.5}
            max={5}
            step={0.1}
            value={[volExtreme]}
            onValueChange={([v]) => onPatch({ volExtreme: v })}
          />
        </Field>
        <Toggle
          label={copy.showRanges}
          checked={showRanges}
          onChange={(v) => onToggle("showRanges", v)}
        />
        <Toggle
          label={copy.muteBounce}
          checked={muteRedBox}
          onChange={(v) => onToggle("muteRedBox", v)}
        />
        <Toggle
          label={copy.notify}
          checked={notifications}
          onChange={async (v) => {
            if (v && "Notification" in window) {
              const perm = await Notification.requestPermission();
              onToggle("notifications", perm === "granted");
              return;
            }
            onToggle("notifications", v);
          }}
        />
      </section>

      <TipSettings lang={lang} copy={copy} />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-cream">{copy.installTitle}</h2>
        <div className="flex items-center gap-3 rounded-xl bg-navy-card px-3 py-3">
          <img
            src="/icon-192.png"
            alt=""
            width={64}
            height={64}
            className="home-icon size-16 object-cover ring-1 ring-gold/50"
          />
          <div className="min-w-0">
            <p className="font-display text-base text-cream">Reloj {coin.symbol}</p>
            <p className="text-xs text-cream-muted">{copy.installIconHint}</p>
          </div>
        </div>
        <p className="text-sm text-cream-muted">{copy.installIos}</p>
        <p className="text-sm text-cream-muted">{copy.installAnd}</p>
      </section>

      <section className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onExportJson}>
            {copy.exportJson}
          </Button>
          <Button variant="outline" onClick={onExportCsv}>
            {copy.exportCsv}
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            {copy.importJson}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onReset();
            }}
          >
            {copy.reset}
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const j = JSON.parse(await f.text()) as Record<string, unknown>;
              onImport(j);
            } catch {
              /* ignore */
            }
          }}
        />
        <p className="text-xs text-cream-faint">
          {genesis} → {coin.defaultModel.athLocal.slice(0, 10)}{" "}
          {lang === "es" ? "no se toca" : "is frozen"}.
        </p>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-cream-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-navy-card px-3 py-3">
      <span className="text-sm text-cream">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function LangBtn({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 min-w-14 rounded-md px-3 text-sm font-medium",
        on ? "bg-cream text-navy" : "bg-navy-card text-cream-muted",
      )}
    >
      {label}
    </button>
  );
}
