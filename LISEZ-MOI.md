# Carnet — version PWA (installable sur Android)

Ton appli est maintenant une **PWA** : une fois mise en ligne, elle s'installe sur
l'écran d'accueil, s'ouvre en plein écran (sans barre de navigateur) et fonctionne
**hors-ligne**. Tes données restent sur ton téléphone et sont désormais **protégées
de l'effacement automatique**.

## Les fichiers
- `index.html` — ton appli (identique, avec l'ajout PWA)
- `manifest.json` — nom, icône, couleurs de l'appli installée
- `sw.js` — le « service worker » (fait marcher le hors-ligne)
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` — les icônes

⚠️ **Ces fichiers doivent rester ensemble dans le même dossier.**

## Le point important
Une PWA ne marche PAS en ouvrant `index.html` directement (adresse `file://`).
Elle doit être servie depuis une **adresse https://**. C'est gratuit et rapide.

## Le plus simple : Netlify Drop (aucune compétence technique)
1. Va sur **app.netlify.com/drop**
2. Glisse-dépose le **dossier entier** (pas juste index.html) dans la page.
3. Tu obtiens une adresse `https://…netlify.app`. Ouvre-la sur ton téléphone.
4. Dans Chrome : menu ⋮ → **« Installer l'application »** (ou le bouton ⤓ en haut
   de l'appli). Une icône Carnet apparaît sur ton écran d'accueil.

Un compte gratuit permet de garder l'adresse stable. Alternatives équivalentes :
GitHub Pages, Cloudflare Pages, Vercel.

## Tes données
- Elles sont stockées **sur ton téléphone**, dans ce navigateur — pas en ligne.
- L'appli demande le « stockage persistant » pour éviter tout effacement auto.
- **Garde le réflexe Exporter** (Réglages → Sauvegarde) de temps en temps : le
  fichier `.json` est ta ceinture de sécurité, et il te sert à passer d'un
  téléphone à un autre.
- Réinstaller l'appli depuis la même adresse ne supprime pas tes données.

## Et une vraie APK plus tard ?
Depuis cette PWA, on peut générer un vrai `.apk` (via Bubblewrap/TWA) ou ajouter
une synchro cloud pour un risque de perte quasi nul. Dis-le moi si tu veux aller
plus loin.
