This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Cookies & suivi Google Ads

Le site affiche un bandeau de consentement cookies (`components/CookieConsent.tsx`) avant
de charger tout script non essentiel. Le tag de conversion Google Ads
(`components/GoogleAdsTag.tsx`) ne se charge que si l'utilisateur a cliqué "Accepter".

Le compte Google Ads n'étant pas encore finalisé, l'ID de conversion n'est pas encore
renseigné. Une fois disponible (format `AW-XXXXXXXXX`), il suffit de le coller dans la
variable d'environnement `NEXT_PUBLIC_GOOGLE_ADS_ID` (`.env.local` en local, variables
d'environnement du projet sur Vercel en production) — aucune autre modification n'est
nécessaire, la logique de consentement est déjà en place.

Les textes des pages `/mentions-legales` et `/politique-confidentialite` sont éditables
depuis Admin > Contenu (table `contenu_site`, clés `mentions_legales` et
`politique_confidentialite`), avec une mini-syntaxe (titres `## `, listes `- `, tableaux,
`**gras**`, `[lien](/url)`, jeton `{{gerer-cookies}}` — voir `lib/renderLegalMarkdown.tsx`).
Le texte par défaut vit dans `lib/legalContentDefaults.ts` et sert de repli tant qu'aucune
ligne n'existe en base (créée une première fois par `scripts/seed-legal-content.mjs`) ; ce
texte a une valeur juridique, donc toute modification depuis l'admin doit être relue avant
publication.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- vercel-git-integration-check -->
