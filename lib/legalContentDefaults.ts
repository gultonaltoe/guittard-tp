// Texte par défaut des pages légales, utilisé tant que Vincent n'a rien
// modifié depuis Admin > Contenu (voir contenu_site.mentions_legales /
// contenu_site.politique_confidentialite). Garder ce texte synchronisé avec
// celui inséré en base par scripts/seed-legal-content.mjs.

export const DEFAULT_MENTIONS_LEGALES = `## Éditeur du site

- Raison sociale : VINCENT GUITTARD TP & TERRASSEMENT
- Forme juridique : SARL au capital social de 1 000 €
- Siège social : 38 Rue Principale, 68780 Sternenberg
- SIREN : 106 814 502 — SIRET : 106 814 502 00014
- RCS Mulhouse (Haut-Rhin)
- Code APE/NAF : 43.12A (Travaux de terrassement courants et travaux préparatoires)
- Directeur de la publication : Vincent Guittard, gérant
- Contact : contact@guittardtp.fr — 06 66 82 24 18

## Hébergement

- Hébergeur : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis — privacy@vercel.com
- Base de données / stockage des images : Supabase, Inc. (supabase.com)

## Conception du site

Julien Altoé

## Propriété intellectuelle

L'ensemble des contenus présents sur ce site (textes, photographies, logo, mise en page) est la propriété de VINCENT GUITTARD TP & TERRASSEMENT, sauf mention contraire. Toute reproduction ou représentation, totale ou partielle, sans autorisation préalable, est interdite.

## Données personnelles

Le traitement des données personnelles collectées via ce site est détaillé dans la [Politique de confidentialité](/politique-confidentialite).`;

export const DEFAULT_POLITIQUE_CONFIDENTIALITE = `## Responsable du traitement

Vincent Guittard, gérant de la SARL VINCENT GUITTARD TP & TERRASSEMENT, 38 Rue Principale, 68780 Sternenberg — contact@guittardtp.fr

## Données collectées et finalités

| Formulaire / source | Données collectées | Finalité | Base légale |
| --- | --- | --- | --- |
| Formulaire de contact | Nom, email, téléphone (optionnel), description du projet | Répondre à une demande de devis/contact | Intérêt légitime (traiter une demande entrante) |
| Formulaire d'avis client (si/quand activé) | Nom, ville (optionnel), note, type de prestation (optionnel), texte de l'avis | Publier un avis client après modération | Consentement (l'internaute choisit de déposer un avis) |
| Suivi des conversions Google Ads | Cookie de mesure publicitaire (pas de donnée directement identifiante) | Mesurer l'efficacité de la campagne Google Ads | Consentement (recueilli via le bandeau cookies) |

Aucune donnée n'est collectée à des fins de prospection commerciale par un tiers, ni revendue.

## Destinataires des données

Seul Vincent Guittard a accès aux données transmises via les formulaires. Elles ne sont communiquées à aucun tiers, à l'exception des sous-traitants techniques suivants :

- **Vercel Inc.** (hébergement du site) — États-Unis
- **Supabase, Inc.** (stockage des données et des images) — États-Unis
- **Google LLC** (Google Ads — mesure des conversions publicitaires, uniquement après consentement) — États-Unis

Ces prestataires peuvent impliquer un transfert de données hors Union européenne ; ils s'appuient sur les clauses contractuelles types de la Commission européenne pour encadrer ces transferts.

## Durée de conservation

- Demandes de contact : 3 ans à compter du dernier échange, conformément aux recommandations de la CNIL pour la gestion de la relation commerciale (durée qui peut être réduite si un projet aboutit ou n'aboutit pas, à l'appréciation de Vincent).
- Avis clients publiés : conservés tant qu'affichés sur le site ; supprimés sur demande de leur auteur.
- Cookie de conversion Google Ads : durée de vie technique définie par Google (généralement 90 jours), non modifiable côté site.

## Cookies et traceurs

Ce site utilise deux catégories de cookies :

- **Cookies strictement nécessaires** au fonctionnement du site (pas de consentement requis).
- **Cookie de suivi des conversions Google Ads** : déposé uniquement pour mesurer l'efficacité des campagnes publicitaires (savoir si une visite issue d'une annonce Google a conduit à une demande de contact). Ce cookie n'est **jamais déposé par défaut** — il n'est activé qu'après un consentement explicite, recueilli via le bandeau affiché lors de la première visite. Vous pouvez à tout moment accepter, refuser, ou modifier votre choix depuis {{gerer-cookies}} en pied de page.

En refusant, la navigation sur le site n'est pas affectée : seule la mesure publicitaire est désactivée.

## Droits des personnes concernées

Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Pour exercer ces droits, contactez contact@guittardtp.fr. Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).

## Sécurité

Le site est servi en HTTPS et hébergé chez un prestataire professionnel (Vercel). Des mesures raisonnables sont mises en œuvre pour protéger les données contre l'accès non autorisé, la perte ou la divulgation.`;
