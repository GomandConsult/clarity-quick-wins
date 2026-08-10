import { useEffect, useState } from "react";

const GA_ID = "G-GKBR42WWZ7";
const CONSENT_KEY = "gc_cookie_consent";
const REOPEN_EVENT = "gc:reopen-cookie-prefs";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    gcGaLoaded?: boolean;
  }
}

function loadGA() {
  if (window.gcGaLoaded) return;
  window.gcGaLoaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}

export function reopenCookiePreferences() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "accepted") {
      loadGA();
    } else if (consent !== "declined") {
      setVisible(true);
    }

    const reopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    loadGA();
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Préférences cookies"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-primary px-6 py-5 text-primary-foreground shadow-[0_-8px_24px_rgba(0,0,0,0.15)] sm:px-8"
    >
      <p className="max-w-2xl text-sm text-primary-foreground/85">
        Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre accord,
        Google Analytics pour comprendre comment le site est utilisé.{" "}
        <a
          href="https://gomandconsult.com/politique-cookies.html"
          className="underline hover:text-primary-foreground"
        >
          En savoir plus
        </a>
        .
      </p>
      <div className="flex shrink-0 gap-3">
        <button
          type="button"
          onClick={decline}
          className="rounded-lg border border-primary-foreground/40 px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:border-primary-foreground"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={accept}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
