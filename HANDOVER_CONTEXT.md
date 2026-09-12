# CryptoAgent MVP - Handover Context

## What Is This Project
A Multi-Account AI Twitter Agent that generates crypto tweets using AI, sends them for human approval via Telegram, and logs/posts them. Built using **n8n** (workflow automation, Node.js based) running locally on Windows.

---

## Current State: MVP Working (Partially)

### What Works
- **CoinGecko node** - Fetches trending coin data. Fully working.
- **Build Prompt (Code node)** - Constructs the full system prompt + user prompt with dynamic env vars. Fully working.
- **OmniRoute (HTTP Request node)** - Sends prompt to local AI server, gets JSON tweet draft back. Fully working.

### What Needs Testing Still
- **Telegram (HIL node)** - Sends draft to Telegram with Approve/Reject buttons. Credential needs to be created in n8n UI.
- **MongoDB (Log node)** - Logs the approved/rejected action. Credential needs to be created in n8n UI.

### Known Issues
1. The `my-combo` model (routes to `claude-haiku-4.5` via OmniRoute) sometimes refuses crypto content due to safety filters. May need prompt tweaking or a different model.
2. ChirpAPI (Twitter posting service at chirpapi.fun) is currently broken/down. Twitter posting is mocked - we just log to MongoDB instead.

---

## File Structure
```
C:\Users\VIVEK\Desktop\CryptoAgent\
├── .env                          # All config (API keys, model, persona, URLs)
├── sys_Design.md                 # Original full system design document
├── MVP_DESIGN.md                 # Simplified MVP breakdown with test cases
├── workflows/
│   └── mvp_content_loop.json     # The n8n workflow file (import into n8n)
├── config/                       # Empty, for future config files
└── docs/                         # Empty, for future docs
```

---

## .env File (All Config Lives Here)
```
twitterapi=<YOUR_CHIRPAPI_TOKEN>
coingecko_api=<YOUR_COINGECKO_KEY>
mongo_uri=<YOUR_MONGODB_CONNECTION_STRING>
omni=<YOUR_OMNIROUTE_KEY>
TELEGRAM_BOT_TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
MVP_MODEL=my-combo
MVP_PERSONA=You are a snarky crypto degen. Keep it short.
MVP_DATA_SOURCE=coingecko
ACCOUNT_HANDLE=@CryptoAgent
ACCOUNT_ID=crypto_agent_01
OMNI_KEY=<YOUR_OMNIROUTE_KEY>
OMNI_BASE_URL=http://127.0.0.1:20128/v1
TELEGRAM_CHAT_ID=<YOUR_TELEGRAM_CHAT_ID>
```

---

## n8n Workflow Flow (5 nodes)
```
Manual Trigger → CoinGecko (HTTP GET) → Build Prompt (Code) → OmniRoute (HTTP POST) → Telegram (Send Message) → MongoDB (Insert)
```

### Key Design Decisions
1. **Code node builds the prompt** - Instead of using n8n's native OpenAI node (which locks you into n8n's credential vault), we use a Code node + HTTP Request. This makes the AI provider fully swappable via .env (just change OMNI_BASE_URL, OMNI_KEY, MVP_MODEL).
2. **JSON mode enabled** - `response_format: { type: "json_object" }` is set in the request body so the model returns clean JSON without markdown fences.
3. **All config from .env** - Model, persona, account handle, base URL, API keys - everything reads from env vars. Nothing is hardcoded.

---

## How to Run Locally
1. Start OmniRoute: `omniroute serve` (from `C:\Users\VIVEK\Desktop\OmniRoute`)
2. Start n8n with env access: `$env:N8N_BLOCK_ENV_ACCESS_IN_NODE="false"; n8n start` (from `C:\Users\VIVEK\Desktop\CryptoAgent`)
3. Open `http://localhost:5678`
4. Import `workflows/mvp_content_loop.json`
5. Create Telegram credential (paste bot token) and MongoDB credential (paste mongo_uri) in the n8n UI
6. Click "Test Workflow"

---

## System Prompt Summary
The full system prompt is inside the "Build Prompt" Code node. It includes:
- **Layer 1 (Static)**: Persona voice, emoji set, 8 hard rules (no financial advice, no fabricated data, disclaimers required, no repeated content, promote Telegram tool, etc.), and strict JSON output format.
- **Layer 2 (Dynamic)**: Account ID, content type, lane, target tweet (for replies), history exclusion list, and CoinGecko data payload.

The AI must return this exact JSON schema:
```json
{
  "content_type": "post|reply|quote",
  "lane": "pulse|opinion|tools|education|meme|null",
  "text": "the actual tweet",
  "tickers": [],
  "narrative_tag": "...",
  "image_prompt": "...|null",
  "needs_human_review": true/false,
  "disclaimer_included": true/false,
  "needs_more_data": false
}
```

---

## What Needs To Be Done Next
1. **Create Telegram + MongoDB credentials in n8n UI** and test the full end-to-end flow.
2. **Add a Validation Code node** after OmniRoute that independently checks `tickers.length > 0` and forces `needs_human_review: true` (don't trust the model's flag). Also skip posting if `needs_more_data: true`.
3. **Strip the JSON from the AI response** - The `content` field from OmniRoute contains the JSON as a string. A Code node should `JSON.parse()` it before passing to Telegram/MongoDB.
4. **Telegram Wait node** - Currently the flow goes straight from Telegram send to MongoDB. It should WAIT for the user to click Approve/Reject before logging.
5. **Deploy to Hugging Face** - Needs a Dockerfile, and OMNI_BASE_URL must be changed to a cloud AI provider (since localhost won't be reachable).

---

## OmniRoute Details
- Installed globally via npm on this machine
- Config at `C:\Users\VIVEK\Desktop\OmniRoute\.env`
- Runs on `http://localhost:20128` (API at `/v1`)
- `my-combo` model routes to `claude-haiku-4.5`
- OpenAI-compatible API format

## n8n Details
- Version: 2.37.10 (Self Hosted, installed via npm)
- Must be started with `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` to allow .env access
- Dashboard: `http://localhost:5678`
