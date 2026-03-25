# Corrected Winsales AI Files

## Files
- `index.html` -> corrected frontend
- `server.js` -> corrected backend
- `package.json` -> backend dependencies
- `.env.example` -> environment variable template

## Run locally
1. Put `server.js`, `package.json`, and `.env` in your backend folder.
2. Create `.env` from `.env.example` and add your real Gemini API key.
3. Run:
   npm install
   npm start
4. Open `index.html` in the browser.

## Important
- The frontend now sends AI requests to `http://localhost:3000/api/chat`
- If you deploy the backend online, update `API_BASE_URL` inside `index.html`
- GitHub Pages alone cannot run `server.js`
