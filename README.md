# 🏷️ dipop

**dipop — F&M's Campus Marketplace, Give-and-Take Room, and Reward Economy**

Built for the **Social Good** track at the F&M Hackathon.

## 🔎 What it does

dipop is a campus marketplace for Franklin & Marshall students, gated behind `@fandm.edu` sign-in, that brings together three things F&M students already do informally and gives them one real home:

- **Marketplace** — buy, sell, or give away items for free directly with other students.
- **Give and Take Room (GATR)** — a guided flow for donating clean, usable items to F&M's physical Give and Take Room, with hours and drop-off instructions built in.
- **Food Corner** — a staff-managed board of available food/supplies, with allergen and quantity info for students to claim.

Every donation to GATR can be credited with **Dipomine**, dipop's reward currency, by Faculty/Staff. Students can redeem Dipomine for real campus perks — from meal swipes and Flex dollars up to a free A in a class — turning "giving your stuff away responsibly" into something that's actually worth doing.

The app recognizes two roles, Student and Staff, which unlock different actions (e.g. only Staff can award Dipomine or add Food Corner inventory).

## 💡 Inspiration

F&M already has a buy/sell bulletin for students — almost nobody has heard of it. That's because it runs on Google Bulletin, which makes posting and browsing cartoonishly hard to navigate. The tool that was supposed to solve this problem on campus was quietly part of the problem. We wanted something students would actually open: a clean marketplace that also nudges people toward the more sustainable option (donating to GATR) by actually rewarding it.

## 🛠 How we built it

### Tech Stack

- **Backend**: Python + FastAPI, exposing a small REST API (`/api/listings`, `/api/food`, `/api/upload`) that the frontend talks to directly — it never sees the underlying data store or secrets.
- **Data store**: Google Sheets, used as a lightweight, staff-editable database. Reads go through the public `gviz` CSV endpoint; writes go through a Google service account via `gspread`.
- **Image hosting**: Cloudinary, for listing and Food Corner photos.
- **Frontend**: React 19 + TypeScript + Vite, styled with Tailwind CSS v4 and Material Symbols icons, with `motion` for animation.

### Notable design choices

- The backend reshapes raw sheet rows into the exact shape the frontend expects (`types.ts`), so the frontend has no knowledge of spreadsheet columns, and the sheet can be edited by hand without breaking the app.
- Dipomine balances and redemptions are the gamification layer that ties Marketplace, GATR, and the reward catalog together — donating is the only way to earn it.
- Food Corner inventory is currently local-only on the frontend (not yet persisted back to the sheet) — see What's Next.

## ⚔ Challenges we ran into

<ENTER INTO THIS PLACEHOLDER>

## 🏆 Accomplishments we're proud of

<ENTER INTO THIS PLACEHOLDER>

## 📚 What we learned

<ENTER INTO THIS PLACEHOLDER>

## 🚀 What's next for dipop

<ENTER INTO THIS PLACEHOLDER>

## 🎥 Demo Video

<ENTER INTO THIS PLACEHOLDER>

## 🔩 Installation

Follow the steps below to run dipop locally. The backend and frontend run as two separate processes.

### 📦 Prerequisites

- Node.js (v18+) and npm
- Python 3.10+ (3.11+ recommended)
- Git
- A Google Cloud service account with Sheets + Drive API access, pointed at a spreadsheet with `marketplace`, `food_corner`, and `gatr` tabs
- A Cloudinary account (for image uploads)

### 1) Clone the repository

```bash
git clone https://github.com/Kuail33/dipop.git
cd dipop
```

### 2) Configure secrets

Create `.streamlit/secrets.toml` in the project root:

```toml
[connections.gsheets]
spreadsheet = "<ENTER INTO THIS PLACEHOLDER>"
type = "service_account"
project_id = "<ENTER INTO THIS PLACEHOLDER>"
private_key_id = "<ENTER INTO THIS PLACEHOLDER>"
private_key = "<ENTER INTO THIS PLACEHOLDER>"
client_email = "<ENTER INTO THIS PLACEHOLDER>"
client_id = "<ENTER INTO THIS PLACEHOLDER>"
token_uri = "https://oauth2.googleapis.com/token"

[cloudinary]
cloud_name = "<ENTER INTO THIS PLACEHOLDER>"
api_key = "<ENTER INTO THIS PLACEHOLDER>"
api_secret = "<ENTER INTO THIS PLACEHOLDER>"
```

### 3) Run the backend

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 4) Run the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

By default the frontend talks to `http://localhost:8000`. To point it elsewhere, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.
