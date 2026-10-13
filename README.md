# SpeechAI — Speech-to-Text & NLP Analyzer

SpeechAI is a local-first speech workspace that turns audio into a readable transcript and useful language insights. It combines browser recording and uploads with local Faster-Whisper transcription, lightweight NLP, and MongoDB-backed history.

## Features

- Record speech in the browser or upload an audio file.
- Transcribe audio locally with Faster-Whisper and detect its language.
- Copy or download transcripts.
- Analyze word, sentence, and character counts, key terms, named entities, and sentiment.
- Save, search, reopen, and delete past analyses in MongoDB.
- Responsive dashboard with light and dark themes.
- Validate uploads and remove temporary audio files after processing.

## Technology stack

- **Frontend:** React, Vite, JavaScript, Tailwind CSS, Lucide React, Axios
- **Backend:** Python, Flask, Flask-CORS, python-dotenv
- **Speech-to-text:** Faster-Whisper (`base`, CPU int8 by default)
- **NLP:** NLTK and spaCy
- **Database:** MongoDB with PyMongo

## Project structure

```text
Speech-to-Text-NLP/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── nlp.py
│   ├── speech.py
│   ├── requirements.txt
│   ├── .env.example
│   └── uploads/
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       └── services/api.js
├── README.md
└── .gitignore
```

## Requirements

- Python 3.10–3.13
- Node.js 18 or newer and npm
- MongoDB 6.0 or newer
- Microphone access for browser recording (localhost and HTTPS are secure contexts)

The first transcription downloads the Faster-Whisper `base` model. Later runs reuse the local model cache.

## MongoDB setup

Install and start MongoDB Community Server. The default local connection is `mongodb://localhost:27017`. The app creates the `speech_nlp_db` database and `analyses` collection on the first saved analysis, and adds a descending index on `created_at`.

For authenticated MongoDB, create an application user with read/write access to `speech_nlp_db` and put its connection URI in `backend/.env`. URL-encode special characters in URI credentials.

## Environment variables

From the repository root, copy `backend/.env.example` to `backend/.env`:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Example local configuration:

```dotenv
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=speech_nlp_db
FRONTEND_ORIGIN=http://localhost:5173
WHISPER_MODEL=base
```

For an authenticated MongoDB server, use a URI such as `mongodb://username:password@localhost:27017/?authSource=admin`. Keep `.env` private; it is excluded from Git. Never put actual credentials in `.env.example`.

## Build the frontend

Build the frontend once, or again whenever its source changes:

```powershell
cd frontend
npm install
npm run build
```

## Run the application

After building the frontend, open a terminal in `backend/`:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('vader_lexicon')"
python app.py
```

Open `http://localhost:5000`. Flask serves both the built frontend and the API, so the application runs with this single command after the frontend build. If the build is missing, the root page reports that `npm run build` must be run from `frontend/`. PyAV is pinned below version 19 because Faster-Whisper uses an audio-decoding option removed in PyAV 19. CPU inference uses int8 to limit memory usage.

## Deploy to GitHub, Vercel, and Render

Vercel hosts the static frontend; Render hosts the Flask API and Faster-Whisper backend. The backend uses downloaded NLP and speech models, so it is not configured as a Vercel function.

1. Push this project to a GitHub repository. The root `vercel.json` configures Vercel to build `frontend/`.
2. In Vercel, import the repository and deploy it. Set the `VITE_API_URL` environment variable to `https://<your-render-service>.onrender.com/api`, then redeploy after setting it.
3. In Render, create a Blueprint from the repository using `render.yaml`. Provide `MONGO_URI` from a MongoDB service reachable from Render (for example, MongoDB Atlas), and set `FRONTEND_ORIGIN` to the deployed Vercel site origin, such as `https://<your-project>.vercel.app`.
4. After both services are deployed, verify the backend at `https://<your-render-service>.onrender.com/api/health` and open the Vercel site.

Use a Render instance with enough memory for the selected Faster-Whisper model. Keep database credentials in Render's environment settings, never in Git or `.env.example`. Vercel preview deployments use different origins; update `FRONTEND_ORIGIN` if you need the backend to allow a preview URL.

## Frontend development

To work on the frontend with Vite's hot reload, run this in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend calls `http://localhost:5000/api` by default. To change the API origin, create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

## How to use

1. Start MongoDB and the Flask backend.
2. Start the Vite frontend and open it in a browser.
3. Record a short sample or upload a supported audio file (up to 50 MB).
4. Select **Transcribe & analyze** and wait for the result.
5. Review the transcript and insights. Use **History** to reopen or delete saved results.

If MongoDB is unavailable, transcription and NLP analysis are still returned, but the result is marked as unsaved and will not appear in History.

## API endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check that the backend is running |
| `POST` | `/transcribe` | Multipart audio upload (`file` field); transcribes, analyzes, then saves when MongoDB is available |
| `POST` | `/analyze` | Analyze and save JSON `{ "transcript": "...", "audio_filename": "...", "language": "en" }` |
| `GET` | `/history` | List saved analyses, newest first |
| `GET` | `/history/<id>` | Fetch a saved analysis by MongoDB ObjectId |
| `DELETE` | `/history/<id>` | Delete a saved analysis |

Supported extensions: WAV, MP3, M4A, MP4, MPEG, MPGA, WEBM, OGG, and FLAC. User-facing errors are friendly; detailed exceptions are written to the backend log.

## Screenshots

Add screenshots of the dashboard, analysis result, and history here.

## Future improvements

- Streaming transcription for longer recordings.
- More language-specific NLP models and richer sentiment trends.
- User accounts and per-user history.
- Export analysis reports in additional formats.
