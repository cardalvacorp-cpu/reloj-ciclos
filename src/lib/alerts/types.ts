export type AlertType =
  | "BREAKOUT"
  | "WHALE"
  | "VOLUME"
  | "BUY"
  | "SELL"
  | "MOVE"
  | "ANALOG"
  | "TURN"
  | "PRE_TURN";

export type AlertItem = {
  id: string;
  type: AlertType;
  ts: number;
  line1: string;
  line2: string;
  phase: string;
  pct: number;
  layers: { clock: string; analog: string; flow: string };
  seen: boolean;
  matters: boolean;
  noise: boolean;
  extreme?: boolean;
};
