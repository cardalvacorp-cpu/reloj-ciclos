import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  IChartApiBase,
  IPanePrimitive,
  IPrimitivePaneRenderer,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import type { Phase } from "@/lib/cycle/model";
import type { Lang } from "@/lib/cycle/time";

type Band = {
  start: UTCTimestamp;
  end: UTCTimestamp;
  color: string;
  label: string;
};

class BandsRenderer implements IPrimitivePaneRenderer {
  constructor(
    private readonly rects: Array<{
      x1: number;
      x2: number;
      color: string;
      label: string;
    }>,
  ) {}

  drawBackground(target: CanvasRenderingTarget2D) {
    target.useMediaCoordinateSpace((scope) => {
      const ctx = scope.context;
      const h = scope.mediaSize.height;
      for (const b of this.rects) {
        const left = Math.min(b.x1, b.x2);
        const right = Math.max(b.x1, b.x2);
        const w = right - left;
        if (w < 1) continue;
        ctx.fillStyle = b.color;
        ctx.fillRect(left, 0, w, h);
        if (w > 52) {
          ctx.fillStyle = "rgba(247,244,234,0.78)";
          ctx.font = "600 11px IBM Plex Sans, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(b.label, left + 6, 8);
        }
      }
    });
  }

  draw() {
    /* background only */
  }
}

export class CycleBandsPrimitive implements IPanePrimitive<Time> {
  private chart: IChartApiBase<Time> | null = null;
  private requestUpdate: (() => void) | null = null;
  private bands: Band[] = [];
  private readonly views: {
    zOrder: () => "bottom";
    renderer: () => IPrimitivePaneRenderer | null;
  }[];

  constructor() {
    this.views = [
      {
        zOrder: () => "bottom",
        renderer: () => this.makeRenderer(),
      },
    ];
  }

  setPhases(phases: Phase[], lang: Lang) {
    this.bands = phases
      .filter((p) => p.kind === "up" || p.kind === "down")
      .map((p) => {
        const days = p.modelDays ?? p.listedDays;
        const kind =
          p.kind === "up"
            ? lang === "es"
              ? "SUBE"
              : "UP"
            : lang === "es"
              ? "BAJA"
              : "DOWN";
        return {
          start: Math.floor(p.startMs / 1000) as UTCTimestamp,
          end: Math.floor((p.endMs - 1) / 1000) as UTCTimestamp,
          color:
            p.kind === "up" ? "rgba(27,122,78,0.30)" : "rgba(176,58,46,0.30)",
          label: `${kind} ${days}d`,
        };
      });
    this.requestUpdate?.();
  }

  attached(param: {
    chart: IChartApiBase<Time>;
    requestUpdate: () => void;
  }) {
    this.chart = param.chart;
    this.requestUpdate = param.requestUpdate;
  }

  detached() {
    this.chart = null;
    this.requestUpdate = null;
  }

  updateAllViews() {
    /* coordinates are read live in renderer */
  }

  paneViews() {
    return this.views;
  }

  private makeRenderer(): IPrimitivePaneRenderer | null {
    const chart = this.chart;
    if (!chart || this.bands.length === 0) return null;
    const ts = chart.timeScale();
    const rects = this.bands.map((b) => {
      const x1 = ts.timeToCoordinate(b.start);
      const x2 = ts.timeToCoordinate(b.end);
      return {
        x1: x1 ?? -80,
        x2: x2 ?? (x1 != null ? x1 + 12 : -80),
        color: b.color,
        label: b.label,
      };
    });
    return new BandsRenderer(rects);
  }
}
