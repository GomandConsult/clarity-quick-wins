# Marketing Clarity

Mini-diagnostic marketing en 10 questions (lead magnet) — React 19 / TanStack Start / Vite, déployé sur Netlify.

## Développement local

```bash
npm install
cp .env.example .env   # renseigner RESEND_API_KEY
npm run dev
```

## Variables d'environnement

- `RESEND_API_KEY` — clé API [Resend](https://resend.com), utilisée pour envoyer le mini-rapport par email.
- `SEND_REPORT_BCC` — (optionnel) copie chaque envoi vers cette adresse.

## Déploiement (Netlify)

1. Connecter ce dépôt sur [app.netlify.com](https://app.netlify.com) (New site from Git). Le build est déjà configuré via `netlify.toml` (`npm run build`).
2. Dans Site settings → Environment variables, ajouter `RESEND_API_KEY` (et `SEND_REPORT_BCC` si besoin).
3. Dans Resend, vérifier le domaine d'envoi `clarity.gomandconsult.com` (ajout des enregistrements DNS fournis par Resend — SPF/DKIM).
4. Dans Netlify → Domain management, ajouter le sous-domaine cible (ex. `clarity.gomandconsult.com`) puis pointer son DNS (CNAME) selon les instructions de Netlify.
