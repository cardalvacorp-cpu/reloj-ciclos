import type { Lang } from "@/lib/cycle/time";

export function speak(text: string, lang: Lang) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "es" ? "es-US" : "en-US";
  u.rate = 1;
  u.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const want = lang === "es" ? "es" : "en";
  const match = voices.find(
    (v) => v.lang.toLowerCase().startsWith(want) && v.lang.toLowerCase().includes("us"),
  ) ?? voices.find((v) => v.lang.toLowerCase().startsWith(want));
  if (match) u.voice = match;
  window.speechSynthesis.speak(u);
}
