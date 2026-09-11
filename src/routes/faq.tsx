import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/pages/PageShell";
import { SITE_URL } from "@/lib/site/brand";
import { useAppStore } from "@/lib/store";

const TITLE = "FAQ — Watch Cycles";
const DESCRIPTION =
  "Is this financial advice, why 1,064 and 364 days, what happens if the model fails, and whether the Bitcoin cycle clock applies to altcoins.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/faq` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/faq` }],
  }),
  component: FaqPage,
});

type Qa = { q: { es: string; en: string }; a: { es: string[]; en: string[] } };

const QAS: Qa[] = [
  {
    q: {
      es: "¿Esto es asesoría financiera?",
      en: "Is this financial advice?",
    },
    a: {
      es: [
        "No. Es una tesis pública sobre tiempo, con fechas, publicada para que se pueda juzgar.",
        "Aquí no se dice compra ni vende, no se recomienda tamaño de posición, y no se cobra por señales. Si tomas una decisión con dinero, es tuya.",
      ],
      en: [
        "No. It is a public thesis about time, with dates, published so it can be judged.",
        "Nothing here says buy or sell, nothing recommends position size, and nothing is charged for signals. If you make a decision with money, it is yours.",
      ],
    },
  },
  {
    q: {
      es: "¿Por qué 1.064 y 364 días?",
      en: "Why 1,064 and 364 days?",
    },
    a: {
      es: [
        "Salen de medir los ciclos cerrados de Bitcoin entre techo y suelo con cierres diarios: C1 subió 1.068 días y bajó 363; C2 subió 1.061 y bajó 376; C3 subió 1.050.",
        "1.064 y 364 son los números que el modelo usa como referencia frente a esos tramos reales. Los desvíos están publicados en Método, incluido el +12 de C2.",
        "No hay ajuste posterior: si el reloj falla, el desvío queda escrito.",
      ],
      en: [
        "They come from measuring Bitcoin's closed cycles high-to-low on daily closes: C1 ran 1,068 days up and 363 down; C2 ran 1,061 up and 376 down; C3 ran 1,050 up.",
        "1,064 and 364 are the reference numbers the model holds those real legs against. The misses are published on Method, including C2's +12.",
        "There is no back-fitting: when the clock misses, the miss stays on the record.",
      ],
    },
  },
  {
    q: {
      es: "¿Y si falla?",
      en: "What if it fails?",
    },
    a: {
      es: [
        "Hay una regla escrita y con fecha. Si la ventana de tolerancia se cierra sin un suelo con fecha, el mapa viejo deja de ser el mapa y Bitcoin deja de anclarse a 1.064 / 364.",
        "No se re-ajustan los días para que cuadre después. Dos bajas cerradas no son una muestra estadística — el reloj es una hipótesis, no una ley.",
      ],
      en: [
        "There is a written, dated rule. If the tolerance window closes with no dated low, the old map is no longer the map and Bitcoin stops being anchored to 1,064 / 364.",
        "The day counts do not get re-tuned to fit afterwards. Two closed down legs are not a statistical sample — the clock is a hypothesis, not a law.",
      ],
    },
  },
  {
    q: {
      es: "¿Aplica a las altcoins?",
      en: "Does it apply to altcoins?",
    },
    a: {
      es: [
        "No con los mismos números. 1.064 / 364 es de Bitcoin. Cada moneda de la lista se midió por separado, con su propio techo, su propio suelo y sus propios días.",
        "Por eso al cambiar de moneda cambian el día, el total y la zona base. Las altcoins tienen menos ciclos cerrados que Bitcoin, así que su reloj es todavía más frágil.",
      ],
      en: [
        "Not with the same numbers. 1,064 / 364 is Bitcoin's. Every coin in the list was measured separately, with its own high, its own low and its own day counts.",
        "That is why switching coins changes the day, the total and the base zone. Altcoins have fewer closed cycles than Bitcoin, so their clock is even more fragile.",
      ],
    },
  },
];

function FaqPage() {
  const lang = useAppStore((s) => s.lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QAS.map((qa) => ({
      "@type": "Question",
      name: qa.q.en,
      acceptedAnswer: { "@type": "Answer", text: qa.a.en.join(" ") },
    })),
  };

  return (
    <PageShell
      title={{ es: "Preguntas", en: "FAQ" }}
      lead={{
        es: "Las cuatro que importan, respondidas sin rodeos.",
        en: "The four that matter, answered straight.",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {QAS.map((qa) => (
        <section
          key={qa.q.en}
          className="rounded-xl border border-line bg-navy-card px-4 py-3"
        >
          <h2 className="font-display text-base leading-snug text-cream">{qa.q[lang]}</h2>
          {qa.a[lang].map((p, i) => (
            <p
              key={i}
              className={i === 0 ? "mt-2 text-sm leading-snug text-cream" : "mt-2 text-sm leading-snug text-cream-muted"}
            >
              {p}
            </p>
          ))}
        </section>
      ))}
    </PageShell>
  );
}
