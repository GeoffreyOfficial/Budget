# Budget — PWA + sauvegarde automatique Google Drive

Ton appli s'appelle maintenant **Budget**, elle s'installe sur Android (PWA) et
peut sauvegarder automatiquement dans **ton propre Google Drive**.

## Fichiers (à garder ensemble dans le dépôt)
index.html · manifest.json · sw.js · icon-192.png · icon-512.png ·
icon-maskable-512.png · apple-touch-icon.png

---

## 1) Mise en ligne (déjà fait pour toi)
Les fichiers sont sur GitHub Pages, adresse type :
`https://geoffreyofficial.github.io/Budget/`
Ouvre-la sur ton téléphone, puis menu ⋮ de Chrome → **Installer l'application**.

---

## 2) Activer la sauvegarde Google Drive (configuration unique, ~10 min)

La synchro ne marche qu'après avoir créé un « identifiant client » Google gratuit
et l'avoir collé dans l'appli. À faire une seule fois, sur ordinateur de préférence.

### a. Créer le projet et activer l'API
1. Va sur **console.cloud.google.com** (connecte-toi avec ton compte Google).
2. En haut, crée un projet nommé **Budget**.
3. Menu ☰ → **APIs et services → Bibliothèque** → cherche **Google Drive API** → **Activer**.

### b. Écran de consentement
4. Menu ☰ → **APIs et services → Écran de consentement OAuth** (ou « Google Auth Platform »).
5. Type d'utilisateur : **Externe**. Renseigne le nom de l'appli **Budget**,
   ton email d'assistance et ton email développeur. Enregistre.
6. Le scope utilisé (`drive.file`) est **non sensible** : **aucune validation Google
   n'est nécessaire**. Pour que toi ET ta copine puissiez vous connecter :
   - soit ajoute vos **deux emails Google** dans **Utilisateurs de test**,
   - soit clique **Publier l'application** (aucune revue requise avec ce scope).

### c. Créer l'identifiant client
7. Menu ☰ → **APIs et services → Identifiants** → **Créer des identifiants**
   → **ID client OAuth**.
8. Type d'application : **Application Web**. Nom : `Budget web`.
9. Dans **Origines JavaScript autorisées**, clique **Ajouter un URI** et saisis
   EXACTEMENT (minuscules, sans barre finale, sans /Budget) :
   ```
   https://geoffreyofficial.github.io
   ```
10. Clique **Créer**. Copie l'**ID client** affiché
    (il finit par `.apps.googleusercontent.com`).

### d. Coller l'ID dans l'appli
11. Ouvre `index.html`, cherche la ligne :
    ```
    const GOOGLE_CLIENT_ID = "";
    ```
    et colle ton ID entre les guillemets :
    ```
    const GOOGLE_CLIENT_ID = "1234567890-abcd....apps.googleusercontent.com";
    ```
12. **Ré-envoie `index.html`** sur GitHub (Add file → Upload files → Commit).

### e. Connecter
13. Ouvre l'appli → **Réglages → Sauvegarde automatique · Google Drive**
    → **Connecter Google Drive** → choisis ton compte → **Autoriser**.
    À partir de là, chaque changement est sauvegardé tout seul.

---

## Comment ça marche / bon à savoir
- L'appli crée **un seul fichier** `budget-backup.json` dans ton Drive (tu peux le
  voir dans drive.google.com). Il est mis à jour automatiquement.
- **Individuel** : ta copine ouvre la même adresse et se connecte avec **son**
  compte Google → sa propre sauvegarde, dans son propre Drive. Vos budgets ne se
  mélangent jamais. (Si tu as gardé le mode « test », pense à ajouter son email
  dans les utilisateurs de test.)
- **Nouveau téléphone / perte** : installe l'appli, connecte le même compte Google,
  et tes données se restaurent automatiquement depuis Drive.
- L'export `.json` manuel (Réglages) reste dispo comme filet de secours supplémentaire.

## Petits soucis fréquents
- **« Connexion annulée / origin mismatch »** : l'origine autorisée ne correspond pas.
  Elle doit être `https://geoffreyofficial.github.io` en minuscules, sans barre finale,
  et SANS le `/Budget`. Un changement peut mettre quelques minutes à s'appliquer.
- **« Reconnexion nécessaire »** au lancement : appuie une fois sur *Connecter*.
- Rien ne se sauvegarde : vérifie que l'ID client a bien été collé puis `index.html`
  ré-envoyé sur GitHub.
