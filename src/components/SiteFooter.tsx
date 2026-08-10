import { reopenCookiePreferences } from "./CookieConsent";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
      <p>
        Développé par{" "}
        <a
          href="https://gomandconsult.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground text-slate-500 hover:underline"
        >
          Gomand Consult
        </a>
      </p>
      <nav
        aria-label="Liens légaux"
        className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs"
      >
        <a
          href="https://gomandconsult.com/mentions-legales.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Mentions légales
        </a>
        <a
          href="https://gomandconsult.com/politique-confidentialite.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Politique de confidentialité
        </a>
        <a
          href="https://gomandconsult.com/politique-cookies.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Politique de cookies
        </a>
        <button type="button" onClick={reopenCookiePreferences} className="hover:underline">
          Gérer mes cookies
        </button>
      </nav>
    </footer>
  );
}
