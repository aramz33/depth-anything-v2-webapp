# Depth Anything V2 — Application Web

> Projet de Fin d'Études · Télécom SudParis · 2025

**Démo en ligne : [depth-anything-v2-webapp.vercel.app](https://depth-anything-v2-webapp.vercel.app/fr)**

Application web interactive dédiée à l'**estimation de profondeur monoculaire** basée sur le modèle **Depth Anything V2**. À partir d'une simple image ou d'un flux caméra, l'application génère une carte de profondeur temps-réel, puis exploite des modèles de vision par IA (Groq / Llama 4 Scout) pour offrir analyse de sécurité, Q&R spatiale, chat de scène et accessibilité vocale pour personnes malvoyantes.

---

## Architecture du système

![Diagramme de déploiement](public/5-system-deployment.drawio.svg)

Le frontend Next.js est hébergé sur **Vercel**. Il communique avec deux backends distincts :
- **Hugging Face Spaces** — exécute le modèle Depth Anything V2 (Python / Gradio 5) pour l'inférence de profondeur
- **Groq API** — fournit les capacités LLM (vision multimodale, transcription audio)

---

## Fonctionnalités

### Estimation de profondeur
- Upload d'image (glisser-déposer ou sélection fichier) ou capture caméra directe sur mobile
- Envoi au modèle Depth Anything V2 via l'API Gradio 5 (upload → queue → SSE streaming)
- Résultat : carte de disparité **colorisée** (Turbo colormap) + **niveaux de gris** + slider avant/après
- Timeout configurable de 120 secondes, indicateur de progression en temps réel
- Redimensionnement automatique de l'image côté client avant envoi

### Analyse de sécurité navigation
- Sélection du mode de déplacement : **voiture**, **vélo** ou **piéton**
- Réglage de la vitesse via slider (0–130 km/h voiture, 0–50 km/h vélo, 0–15 km/h piéton)
- Le LLM analyse l'image originale + la depth map et retourne un niveau de risque (`safe` / `warning` / `danger`) ainsi qu'un message d'alerte contextualisé
- Convention de profondeur explicitement injectée dans le prompt : couleurs chaudes = proche, couleurs froides = loin

### Q&R spatiale (mode Aménagement)
- Chips de suggestion prédéfinies pour interroger rapidement la scène
- Champ de saisie libre : question en langage naturel sur les dimensions, distances, placement d'objets
- Historique de conversation scrollable avec toutes les Q&R de la session

### Chat de scène
- Initialisation automatique : dès qu'une depth map est disponible, le LLM génère une description initiale de la scène
- Conversation multimodale persistante : l'image + depth map restent injectées dans chaque échange
- Contexte de sécurité optionnel : si une analyse a été lancée, son résultat enrichit le contexte du chat

### Accessibilité vocale (page Caméra)
- Flux caméra en temps réel avec capture photo sur appui du bouton microphone
- Transcription de la question vocale via **Whisper** (`whisper-large-v3-turbo`)
- Inférence de profondeur + analyse de scène enchaînées automatiquement
- Synthèse vocale des réponses via **Web Speech API** (TTS natif navigateur)
- Priorité donnée aux distances : les obstacles les plus proches sont décrits en premier

### Internationalisation
- Interface complète en **français** et **anglais** via next-intl
- Routage i18n automatique : `/fr/...` et `/en/...`
- Prompts LLM et réponses adaptés à la langue sélectionnée

---

## Stack technique

| Couche | Technologie | Détail |
|---|---|---|
| Framework | Next.js 16 (App Router) | Turbopack, React Server Components |
| UI | React 19, Tailwind CSS v4 | Composants Radix UI / shadcn |
| Internationalisation | next-intl 4 | Routage i18n, traductions fr/en |
| Modèle de profondeur | Depth Anything V2 | Hébergé sur Hugging Face Spaces (Gradio 5) |
| LLM vision | Groq API — Llama 4 Scout | Vision multimodale (image + depth map) |
| Transcription | Groq API — Whisper Large v3 Turbo | Speech-to-text |
| Synthèse vocale | Web Speech API | TTS natif navigateur |
| Déploiement frontend | Vercel | |
| Déploiement modèle | Hugging Face Spaces | CPU/GPU gratuit |

---

## Démarrage rapide

### Prérequis

- **Node.js ≥ 20** ([nodejs.org](https://nodejs.org))
- **Clé API Groq** — gratuite sur [console.groq.com](https://console.groq.com) (pas de carte bancaire requise)
- Une URL de Hugging Face Space exposant le modèle Depth Anything V2 via Gradio 5

### 1. Cloner le dépôt

```bash
git clone https://github.com/pl-plt/Monocular-Depth-Vision-PFE.git
cd Monocular-Depth-Vision-PFE
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Ouvrir `.env.local` et renseigner :

```env
# URL de base du Hugging Face Space (sans slash final)
HF_SPACE_BASE=https://<username>-depth-anything-v2-pfe-tsp.hf.space

# Clé API Groq (https://console.groq.com)
GROQ_API_KEY=gsk_...
```

| Variable | Obligatoire | Description |
|---|---|---|
| `HF_SPACE_BASE` | Oui | URL racine du Hugging Face Space hébergeant le modèle. Le Space doit exposer l'API Gradio 5 (`/gradio_api/`). Valeur par défaut dans le code : `https://aramsis-depth-anything-v2-pfe-tsp.hf.space` |
| `GROQ_API_KEY` | Oui | Clé API Groq. Utilisée pour les appels LLM vision (chat, analyse, spatial) et Whisper (transcription). |

### 4. Lancer en développement

```bash
npx next dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Le navigateur redirige automatiquement vers `/fr` (français par défaut). Pour basculer en anglais, naviguer vers `/en`.

### 5. Build de production

```bash
npx next build
npx next start
```

---

## Pages de l'application

| URL | Description |
|---|---|
| `/fr` ou `/en` | Page d'accueil — démo principale avec upload d'image et tous les panneaux d'analyse |
| `/fr/camera` ou `/en/camera` | Page caméra — interface vocale pour accessibilité (microphone + TTS) |
| `/fr/about` ou `/en/about` | Page équipe et liens du projet |

---

## API Routes

Toutes les routes sont des API Routes Next.js (`app/api/`), appelées côté client.

### `POST /api/predict`
Soumet une image au modèle Depth Anything V2 via l'API Gradio 5 du Hugging Face Space.

**Flux d'exécution :** upload fichier → soumission à la queue Gradio → polling SSE → extraction du résultat

| Paramètre | Type | Description |
|---|---|---|
| `imageBase64` | `string` | Image encodée en base64 (data URI accepté) |

**Réponse :**
```json
{
  "grayscale": "<url>",
  "colorized": "<url>",
  "inferenceMs": 4200
}
```

---

### `POST /api/analyze`
Analyse de sécurité de la scène selon le mode de transport.

| Paramètre | Type | Description |
|---|---|---|
| `imageBase64` | `string` | Image originale |
| `depthMapBase64` | `string?` | Depth map colorisée (optionnel, améliore l'analyse) |
| `transport` | `"car" \| "bike" \| "walk"` | Mode de déplacement |
| `speedKmh` | `number` | Vitesse en km/h |
| `locale` | `"fr" \| "en"` | Langue de la réponse |

**Réponse :**
```json
{
  "level": "warning",
  "alert": "Piéton détecté à environ 3 mètres sur la droite."
}
```

---

### `POST /api/chat`
Conversation multimodale sur la scène (image + depth map).

| Paramètre | Type | Description |
|---|---|---|
| `imageBase64` | `string` | Image originale |
| `depthMapBase64` | `string?` | Depth map colorisée |
| `messages` | `ConversationMessage[]` | Historique de conversation |
| `safetyResult` | `SafetyAlert?` | Résultat de sécurité pour enrichir le contexte |
| `locale` | `"fr" \| "en"` | Langue |

**Réponse :**
```json
{
  "messages": [
    { "role": "assistant", "content": "La scène montre une rue avec..." }
  ]
}
```

---

### `POST /api/spatial`
Réponse à une question libre sur l'espace et les distances.

| Paramètre | Type | Description |
|---|---|---|
| `imageBase64` | `string` | Image originale |
| `depthMapBase64` | `string?` | Depth map colorisée |
| `query` | `string` | Question en langage naturel |
| `locale` | `"fr" \| "en"` | Langue |

**Réponse :**
```json
{ "response": "La table est à environ 1,5 mètre de la caméra." }
```

---

### `POST /api/vision-chat`
Assistant vocal optimisé pour personnes non-voyantes — décrit les obstacles par ordre de distance.

| Paramètre | Type | Description |
|---|---|---|
| `imageBase64` | `string` | Image capturée |
| `depthMapBase64` | `string` | Depth map colorisée (obligatoire) |
| `messages` | `ConversationMessage[]` | Historique de conversation |
| `locale` | `"fr" \| "en"` | Langue |

**Réponse :**
```json
{ "response": "À cinquante centimètres devant vous, une chaise. À deux mètres, une table." }
```

---

### `POST /api/transcribe`
Transcription audio → texte via Whisper.

| Paramètre | Type | Description |
|---|---|---|
| `audio` | `Blob` (multipart/form-data) | Fichier audio (WebM, MP4…) |
| `locale` | `"fr" \| "en"` | Langue pour guider Whisper |

**Réponse :**
```json
{ "text": "Qu'est-ce qu'il y a devant moi ?" }
```

---

## Structure du projet

```
depth-anything-v2-webapp/
├── app/
│   ├── [locale]/                   # Routes i18n (fr / en)
│   │   ├── page.tsx                # Page d'accueil — démo principale
│   │   ├── camera/page.tsx         # Page caméra — accessibilité vocale
│   │   └── about/page.tsx          # Page équipe
│   └── api/
│       ├── predict/route.ts        # Estimation de profondeur (Gradio 5 SSE)
│       ├── analyze/route.ts        # Analyse sécurité navigation
│       ├── chat/route.ts           # Chat de scène multimodal
│       ├── spatial/route.ts        # Q&R spatiale
│       ├── vision-chat/route.ts    # Assistant vocal non-voyants
│       └── transcribe/route.ts     # Transcription Whisper
├── components/
│   ├── demo/
│   │   ├── InferencePanel.tsx      # Orchestrateur principal (upload, état global)
│   │   ├── NavigationPanel.tsx     # Sélecteur transport + alerte sécurité
│   │   ├── SceneChat.tsx           # Interface chat de scène
│   │   ├── SpatialPanel.tsx        # Interface Q&R spatiale
│   │   ├── BeforeAfterSlider.tsx   # Slider avant/après (image / depth map)
│   │   ├── ImageUpload.tsx         # Zone de dépôt d'image
│   │   └── SampleImages.tsx        # Images d'exemple préchargées
│   ├── camera/
│   │   └── VoiceConversation.tsx   # Interface vocale (caméra + micro + TTS)
│   └── ui/                         # Composants shadcn (Badge, etc.)
├── lib/
│   ├── types.ts                    # Types partagés : ContentPart, ConversationMessage, SafetyAlert
│   ├── prompts.ts                  # Prompts système centralisés (vision, chat, spatial)
│   ├── inference-api.ts            # Fonctions fetch vers les API routes
│   ├── groq-client.ts              # Client Groq singleton
│   ├── resize-image.ts             # Redimensionnement image côté client avant envoi
│   ├── parse-base64.ts             # Utilitaires base64 / data URI
│   ├── samples.ts                  # Métadonnées des images d'exemple
│   ├── team.ts                     # Membres de l'équipe
│   └── navigation.ts               # Helpers navigation
├── hooks/
│   └── useTTS.ts                   # Hook synthèse vocale (Web Speech API)
├── messages/
│   ├── fr.json                     # Traductions françaises
│   └── en.json                     # Traductions anglaises
├── public/
│   ├── 1-teacher-student-architecture.drawio.svg
│   ├── 2-training-pipeline.drawio.svg
│   ├── 5-system-deployment.drawio.svg
│   └── samples/                    # Images d'exemple (jpg)
├── middleware.ts                    # Middleware next-intl — routage i18n
└── .env.example                    # Modèle de configuration
```

---

## Diagrammes d'architecture ML

### Architecture Teacher-Student
![Architecture teacher-student](public/1-teacher-student-architecture.drawio.svg)

### Pipeline d'entraînement
![Pipeline d'entraînement](public/2-training-pipeline.drawio.svg)

---

## Équipe

| Nom | Rôle | GitHub | LinkedIn |
|---|---|---|---|
| Pierlouis Pillet | ML Engineer | [@pl-plt](https://github.com/pl-plt) | [pierlouis-pillet](https://www.linkedin.com/in/pierlouis-pillet/) |
| Adam Ramsis | ML Engineer | [@aramz33](https://github.com/aramz33) | [adam-ramsis-tsp](https://www.linkedin.com/in/adam-ramsis-tsp/) |
| Rodrick Zegang | ML Engineer | [@rodrickAurellZegang](https://github.com/rodrickAurellZegang) | [rodrick-aurell-zegang](https://www.linkedin.com/in/rodrick-aurell-zegang/) |

---

## Liens

- **Hugging Face Space (modèle)** — [aramsis/depth-anything-v2-pfe-tsp](https://huggingface.co/spaces/aramsis/depth-anything-v2-pfe-tsp)
- **Dépôt GitHub** — [pl-plt/Monocular-Depth-Vision-PFE](https://github.com/pl-plt/Monocular-Depth-Vision-PFE)
- **Papier original** — [Depth Anything V2 — arxiv 2406.09414](https://arxiv.org/abs/2406.09414)
