# Marketing Clarity

Mini-diagnostic marketing en 10 questions (lead magnet) — React 19 / TanStack Start / Vite, déployé sur Netlify.

## Développement local

```bash
npm install
cp .env.example .env   # renseigner RESEND_API_KEY
npm run dev
```

## Variables d'environnement

- `RESEND_API_KEY` — clé API [Resend](https://resend.com), utilisée pour envoyer le mini-rapport et l'email de relance.
- `SEND_REPORT_BCC` — (optionnel) copie chaque envoi de rapport vers cette adresse.
- `HUBSPOT_KEY` — token d'un [Private App HubSpot](https://app.hubspot.com) (scopes `crm.objects.contacts.read` + `crm.objects.contacts.write`), utilisé pour créer/mettre à jour la fiche contact et pour trouver qui doit recevoir la relance.

## Déploiement (Netlify)

1. Connecter ce dépôt sur [app.netlify.com](https://app.netlify.com) (New site from Git). Le build est déjà configuré via `netlify.toml` (`npm run build`).
2. Dans Site settings → Environment variables, ajouter `RESEND_API_KEY`, `HUBSPOT_KEY` (et `SEND_REPORT_BCC` si besoin).
3. Dans Resend, vérifier le domaine d'envoi `clarity.gomandconsult.com` (ajout des enregistrements DNS fournis par Resend — SPF/DKIM).
4. Dans Netlify → Domain management, ajouter le sous-domaine cible (ex. `clarity.gomandconsult.com`) puis pointer son DNS (CNAME) selon les instructions de Netlify.

## CRM (HubSpot)

Chaque quiz complété crée ou met à jour une fiche contact HubSpot (par email) avec le score, la priorité #1, les scores par pilier, et les dates d'envoi du rapport / de la relance. Rien n'est stocké ailleurs — HubSpot sert aussi de base pour piloter la relance automatique.

**Avant le premier déploiement**, créez les propriétés personnalisées HubSpot une fois (idempotent, peut être relancé sans risque) :

```bash
HUBSPOT_KEY=votre-token node scripts/setup-hubspot-properties.mjs
```

## Relance automatique

`netlify/functions/send-followups.mts` tourne une fois par jour (cron Netlify Scheduled Functions). Elle cherche dans HubSpot les contacts dont le rapport a été envoyé il y a au moins 2 jours et qui n'ont pas encore reçu la relance, envoie l'email « On avance sur votre priorité marketing ? » via Resend, puis marque `clarity_followup_sent_at`. Aucune configuration supplémentaire n'est nécessaire — Netlify détecte et planifie automatiquement les fonctions du dossier `netlify/functions/`.
