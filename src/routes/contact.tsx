import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageShell, Section } from "@/components/pages/PageShell";
import { BRAND, CONTACT, SITE_URL, X_HANDLE, X_URL } from "@/lib/site/brand";
import { useAppStore } from "@/lib/store";

const TITLE = "Contact — Watch Cycles";
const DESCRIPTION =
  "Contact Watch Cycles: questions about the cycle model, corrections to the log, press, and advertising or sponsorship enquiries.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/contact` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

function MailLink({ subject }: { subject: string }) {
  return (
    <a
      href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gold/50 px-3 font-mono text-sm text-gold"
    >
      <Mail className="size-4 shrink-0" />
      {CONTACT.email}
    </a>
  );
}

function ContactPage() {
  const lang = useAppStore((s) => s.lang);

  return (
    <PageShell
      title={{ es: "Contacto", en: "Contact" }}
      lead={{
        es: "Un solo correo para todo. Se responde a lo concreto: el modelo, el registro, prensa y publicidad.",
        en: "One address for everything. Concrete questions get answered: the model, the log, press and advertising.",
      }}
    >
      <Section heading={{ es: "Escríbenos", en: "Contact us" }}>
        <MailLink subject="Watch Cycles" />
        {X_URL && (
          <a
            href={X_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-3 font-mono text-sm text-cream"
          >
            @{X_HANDLE}
          </a>
        )}
        <p className="text-cream-muted">
          {lang === "es"
            ? "Preguntas sobre el método, correcciones al registro con fuente, o errores del sitio."
            : "Questions about the method, sourced corrections to the log, or bugs on the site."}
        </p>
      </Section>

      <Section heading={{ es: "Quién está detrás", en: "Who is behind this" }}>
        <p>
          {lang === "es" ? "Dueño del sitio: " : "Site owner: "}
          <span className="text-cream">{CONTACT.owner}</span>
        </p>
        <p className="text-cream-muted">
          {lang === "es"
            ? `${BRAND} es una tesis pública sobre el tiempo de los ciclos, no una firma de asesoría. No se gestiona dinero de nadie, no se venden señales y no se cobra por acceso.`
            : `${BRAND} is a public thesis about cycle time, not an advisory firm. No one's money is managed here, no signals are sold, and access is not charged for.`}
        </p>
      </Section>

      <Section heading={{ es: "Publicidad y patrocinio", en: "Advertising and sponsorship" }}>
        <p>
          {lang === "es"
            ? "Hay espacio para patrocinadores en la página. Escribe con el formato, el presupuesto y las fechas."
            : "There is room for sponsors on the page. Write with the format, the budget and the dates."}
        </p>
        <MailLink subject="Advertising — Watch Cycles" />
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-cream-muted">
          <li>
            {lang === "es"
              ? "Se acepta patrocinio directo, identificado como tal en la página."
              : "Direct sponsorship is accepted, and is labelled as such on the page."}
          </li>
          <li>
            {lang === "es"
              ? "No hay redes de anuncios, ni popups, ni nada que tape el reloj."
              : "No ad networks, no popups, nothing that covers the clock."}
          </li>
          <li>
            {lang === "es"
              ? "No se venden señales, ni menciones de tokens, ni listados pagados. Un patrocinador no cambia lo que dice el modelo."
              : "No paid signals, no token shills, no paid listings. A sponsor does not change what the model says."}
          </li>
        </ul>
      </Section>

      <Section heading={{ es: "Privacidad", en: "Privacy" }}>
        <p className="text-cream-muted">
          {lang === "es"
            ? "No hay cuentas ni login. Tus ajustes y tu voto se guardan en tu propio dispositivo. El correo de alertas, hoy, tampoco sale de tu navegador."
            : "There are no accounts and no login. Your settings and your vote stay on your own device. The alerts email, today, also never leaves your browser."}
        </p>
      </Section>
    </PageShell>
  );
}
