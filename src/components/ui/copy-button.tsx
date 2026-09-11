import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label,
  done,
  className,
}: {
  text: string;
  label: string;
  done: string;
  className?: string;
}) {
  const [ok, setOk] = useState(false);

  const run = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setOk(true);
    window.setTimeout(() => setOk(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={() => void run()}
      className={cn(
        "flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-line px-3 text-sm text-cream",
        ok && "border-gold text-gold",
        className,
      )}
    >
      {ok ? <Check className="size-4" /> : <Copy className="size-4" />}
      {ok ? done : label}
    </button>
  );
}
