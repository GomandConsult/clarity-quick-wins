export type PillarKey = "offer" | "audience" | "conversion" | "acquisition" | "measurement";

export interface Pillar {
  key: PillarKey;
  name: string;
  short: string;
  explanation: string[];
  quickWins: { time: string; text: string }[];
}

export interface Question {
  id: number;
  pillar: PillarKey;
  text: string;
}

export const SCALE = [
  { value: 0, label: "Pas du tout" },
  { value: 1, label: "Un peu" },
  { value: 2, label: "Plutôt oui" },
  { value: 3, label: "Oui clairement" },
];

export const QUESTIONS: Question[] = [
  { id: 1, pillar: "offer", text: "En une phrase, mon offre principale est claire (pour qui + résultat + livrable)." },
  { id: 2, pillar: "offer", text: "Je peux expliquer en quoi je suis différent(e) en 10 secondes (preuve, méthode, spécialité)." },
  { id: 3, pillar: "audience", text: "Je sais exactement quel type de client je veux attirer en priorité (ces 30 prochains jours)." },
  { id: 4, pillar: "audience", text: "Mon message parle d'un problème concret du client (pas juste de mes services)." },
  { id: 5, pillar: "conversion", text: "Ma page principale (site ou page LinkedIn) dit clairement quoi faire ensuite (CTA)." },
  { id: 6, pillar: "conversion", text: "Il est facile de me contacter / réserver (en moins de 2 clics)." },
  { id: 7, pillar: "acquisition", text: "Je publie ou j'active mon réseau avec une régularité minimale (au moins 2x/mois)." },
  { id: 8, pillar: "acquisition", text: "Je sais quel canal me rapporte le plus (même approximativement)." },
  { id: 9, pillar: "measurement", text: "Je note mes demandes/leads quelque part (même simple : Notion/Sheet/CRM)." },
  { id: 10, pillar: "measurement", text: "Je suis 1 à 3 indicateurs chaque mois (ex: demandes, conversion, CA, trafic)." },
];

// Tie-break order
export const PILLAR_ORDER: PillarKey[] = ["offer", "audience", "conversion", "acquisition", "measurement"];

export const PILLARS: Record<PillarKey, Pillar> = {
  offer: {
    key: "offer",
    name: "Offre & différenciation",
    short: "Offre",
    explanation: [
      "Votre point de départ : une offre limpide que l'on comprend en une phrase.",
      "Avant de chercher plus de visibilité, clarifiez ce que vous vendez et pourquoi vous.",
    ],
    quickWins: [
      { time: "30 min", text: "Écrivez votre phrase d'offre : Pour [cible], j'aide à [résultat] grâce à [méthode], en [livrable]." },
      { time: "30 min", text: "Listez 3 preuves (résultat, témoignage, exemple, chiffres)." },
      { time: "2 h", text: "Créez 1 mini-pack « offre phare » (nom + contenu + à partir de + délai)." },
    ],
  },
  audience: {
    key: "audience",
    name: "Cible & message",
    short: "Cible",
    explanation: [
      "Parler à tout le monde, c'est ne convaincre personne.",
      "Choisissez un segment prioritaire et reformulez votre message avec ses mots.",
    ],
    quickWins: [
      { time: "30 min", text: "Choisissez 1 segment prioritaire pour 30 jours + notez « pas pour qui »." },
      { time: "30 min", text: "Écrivez 5 phrases « problème client » avec leurs mots." },
      { time: "2 h", text: "Rédigez une mini-FAQ (5 questions) pour lever les objections." },
    ],
  },
  conversion: {
    key: "conversion",
    name: "Présence & conversion",
    short: "Conversion",
    explanation: [
      "Une fois qu'un visiteur arrive, sait-il quoi faire dans les 5 secondes ?",
      "Un seul CTA clair, partout, accélère plus la croissance qu'un nouveau site.",
    ],
    quickWins: [
      { time: "30 min", text: "Ajoutez 1 CTA unique partout (profil, site, signature)." },
      { time: "30 min", text: "Rendez le contact évident (bouton réserver / devis)." },
      { time: "2 h", text: "Ajoutez 3 preuves visibles (avis, logos, cas, témoignages)." },
    ],
  },
  acquisition: {
    key: "acquisition",
    name: "Acquisition & contenu",
    short: "Acquisition",
    explanation: [
      "La régularité bat l'intensité. Un canal, tenu 30 jours, vaut mieux que cinq lancés en l'air.",
      "Identifiez ce qui marche déjà — même approximativement — et doublez la dose.",
    ],
    quickWins: [
      { time: "30 min", text: "Choisissez 1 canal principal pour 30 jours." },
      { time: "30 min", text: "Planifiez 2 posts / 2 actions réseau pour les 14 prochains jours." },
      { time: "2 h", text: "Créez 1 template réutilisable (post ou message de reconnexion)." },
    ],
  },
  measurement: {
    key: "measurement",
    name: "Mesure & système",
    short: "Mesure",
    explanation: [
      "Sans mesure, pas de décision : vous pilotez à l'aveugle.",
      "Trois indicateurs simples, suivis chaque semaine, suffisent à reprendre la main.",
    ],
    quickWins: [
      { time: "30 min", text: "Créez un tableau « Leads » (date, source, besoin, next step)." },
      { time: "30 min", text: "Choisissez 3 KPI max et notez-les 1x/semaine." },
      { time: "2 h", text: "Bloquez 20 min/semaine « revue marketing »." },
    ],
  },
};

export function scoreLabel(total: number): string {
  if (total <= 10) return "À clarifier";
  if (total <= 20) return "En progression";
  return "Solide";
}

export interface DiagnosticResult {
  total: number;
  label: string;
  pillarScores: Record<PillarKey, number>;
  priority: PillarKey;
}

export function computeResult(answers: Record<number, number>): DiagnosticResult {
  const pillarScores = { offer: 0, audience: 0, conversion: 0, acquisition: 0, measurement: 0 } as Record<PillarKey, number>;
  let total = 0;
  for (const q of QUESTIONS) {
    const v = answers[q.id] ?? 0;
    pillarScores[q.pillar] += v;
    total += v;
  }
  // Lowest score; tie-break by PILLAR_ORDER
  let priority: PillarKey = PILLAR_ORDER[0];
  let min = Infinity;
  for (const p of PILLAR_ORDER) {
    if (pillarScores[p] < min) {
      min = pillarScores[p];
      priority = p;
    }
  }
  return { total, label: scoreLabel(total), pillarScores, priority };
}

export const BOOKING_URL = "https://calendar.notion.so/meet/gomandconsult/premiereconsultation";
