"""dipop API: maps the Google Sheet into the frontend's exact types.ts shape.

Run from the dipop/ root:  uvicorn backend.main:app --reload --port 8000
The frontend talks to this; it never sees the sheet columns or the secrets.
"""
import math
import re
from typing import List, Optional

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import store

app = FastAPI(title="dipop API")

# Dev CORS: the Vite dev server runs on :3000. Open for the hackathon.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- helpers: sheet row -> types.ts shape --------------------------------

def _s(v) -> str:
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    s = str(v).strip()
    return "" if s.lower() == "nan" else s


def _initials(name_or_email: str) -> str:
    clean = _s(name_or_email).split("@")[0].strip()
    parts = [p for p in re.split(r"[.\s_-]+", clean) if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    if len(clean) >= 2:
        return clean[:2].upper()
    return clean.upper() or "FM"


def _iso(v) -> str:
    s = _s(v)
    if not s:
        return pd.Timestamp.now().isoformat()
    t = pd.to_datetime(s, errors="coerce")
    return (pd.Timestamp.now() if pd.isna(t) else t).isoformat()


def _price(v) -> float:
    try:
        f = float(v)
        return 0.0 if math.isnan(f) else f
    except (TypeError, ValueError):
        return 0.0


def _split_photos(cell: str) -> List[str]:
    """A listing's image_url cell can hold multiple URLs, pipe-separated."""
    return [p.strip() for p in cell.split("|") if p.strip()]


def _join_photos(photos: List[str]) -> str:
    return " | ".join(p.strip() for p in photos if p and p.strip())


def _sheet_safe(v):
    """Neutralize Google Sheets formula injection (USER_ENTERED evaluates
    leading =, +, -, @ as a formula). Prefix with a literal quote so Sheets
    treats the cell as text."""
    if isinstance(v, str) and v[:1] in ("=", "+", "-", "@"):
        return "'" + v
    return v


def listing_to_ts(row: dict, section: str) -> dict:
    status = "available" if _s(row.get("status")).lower() == "available" else "sold"
    email = _s(row.get("seller_email"))
    poster = _s(row.get("poster_name")) or (email.split("@")[0] if email else "")
    return {
        "id": _s(row.get("listing_id")),
        "name": _s(row.get("product_name")),
        "price": _price(row.get("price")),
        "condition": _s(row.get("condition")) or "Good",
        "size": _s(row.get("size")) or None,
        "brand": _s(row.get("brand")) or None,
        "description": _s(row.get("description")) or None,
        "pickupLocation": _s(row.get("pickup_location")) or None,
        "photos": _split_photos(_s(row.get("image_url"))),
        "sellerName": poster,
        "sellerEmail": email,
        "sellerInitials": _initials(poster or email),
        "createdAt": _iso(row.get("date_post")),
        "status": status,
        "category": section,
    }


def food_to_ts(row: dict) -> dict:
    def g(*names):
        for n in names:
            if _s(row.get(n)):
                return _s(row.get(n))
        return ""

    def gi(*names):
        try:
            return int(float(g(*names)))
        except (TypeError, ValueError):
            return 0

    return {
        "id": g("listing_id", "id"),
        "title": g("title", "product_name", "food_name"),
        "quantity": g("quantity", "size"),
        "pickupLocation": g("pickup_location", "pickupLocation"),
        "hours": g("hours", "pickup_hours"),
        "posterRole": g("poster_role", "posterRole", "poster_name"),
        "posterEmail": g("poster_email", "seller_email", "posterEmail"),
        "notes": g("notes", "description") or None,
        "claimedCount": gi("claimed_count", "claimedCount"),
        "totalSlots": gi("total_slots", "totalSlots"),
        "photos": _split_photos(g("image_url", "imageUrl")),
        "datePost": g("date_post", "datePost") or None,
        "brand": g("brand") or None,
        "allergen": g("Allergen", "allergen") or None,
    }


# ---- request bodies ------------------------------------------------------

class CreateBody(BaseModel):
    category: str
    name: str
    price: float = 0
    condition: str = ""
    size: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    pickupLocation: Optional[str] = None
    photos: List[str] = []
    sellerName: Optional[str] = None
    sellerEmail: str


class StatusBody(BaseModel):
    status: str  # 'available' | 'sold'
    requesterEmail: str


class EditBody(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[str] = None
    size: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    pickupLocation: Optional[str] = None
    photos: Optional[List[str]] = None
    requesterEmail: str


def _row_to_sheet(body) -> dict:
    return {
        "product_name": _sheet_safe(body.name),
        "price": "" if _price(body.price) == 0 else body.price,
        "condition": _sheet_safe(body.condition or ""),
        "size": _sheet_safe(body.size or ""),
        "brand": _sheet_safe(body.brand or ""),
        "description": _sheet_safe(body.description or ""),
        "pickup_location": _sheet_safe(body.pickupLocation or ""),
        "image_url": _join_photos(body.photos),
    }


# ---- routes --------------------------------------------------------------

@app.get("/api/listings")
def get_listings():
    out = []
    for section in ("marketplace", "gatr"):
        try:
            df = store.read_tab(section)
        except Exception:
            continue
        for row in df.to_dict("records"):
            if _s(row.get("listing_id")):
                out.append(listing_to_ts(row, section))
    return out


@app.get("/api/food")
def get_food():
    try:
        df = store.read_tab("food_corner")
    except Exception:
        return []
    return [
        food_to_ts(r)
        for r in df.to_dict("records")
        if _s(r.get("listing_id")) or _s(r.get("title"))
    ]


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    url = store.upload_image(file.file)
    return {"url": url}


@app.post("/api/listings")
def create_listing(body: CreateBody):
    if body.category not in ("marketplace", "gatr"):
        raise HTTPException(400, "category must be marketplace or gatr")
    row = _row_to_sheet(body)
    row["poster_name"] = _sheet_safe(body.sellerName or body.sellerEmail.split("@")[0])
    row["seller_email"] = body.sellerEmail
    new_id = store.add_listing(body.category, row)
    df = store.read_tab(body.category)
    match = [r for r in df.to_dict("records") if _s(r.get("listing_id")) == new_id]
    if match:
        return listing_to_ts(match[0], body.category)
    row.update({"listing_id": new_id, "status": "Available"})
    return listing_to_ts(row, body.category)


def _assert_owner(category: str, listing_id: str, requester_email: str) -> None:
    df = store.read_tab(category)
    match = [r for r in df.to_dict("records") if _s(r.get("listing_id")) == listing_id]
    if not match:
        raise HTTPException(404, "listing not found")
    owner_email = _s(match[0].get("seller_email")).lower()
    if owner_email != _s(requester_email).lower():
        raise HTTPException(403, "only the seller can modify this listing")


@app.patch("/api/listings/{category}/{listing_id}/status")
def patch_status(category: str, listing_id: str, body: StatusBody):
    _assert_owner(category, listing_id, body.requesterEmail)
    sheet_status = "Available" if body.status.lower() == "available" else "Sold"
    try:
        store.set_status(category, listing_id, sheet_status)
    except KeyError:
        raise HTTPException(404, "listing not found")
    return {"ok": True, "id": listing_id, "status": body.status.lower()}


@app.put("/api/listings/{category}/{listing_id}")
def edit_listing(category: str, listing_id: str, body: EditBody):
    _assert_owner(category, listing_id, body.requesterEmail)
    fields = {}
    if body.name is not None:
        fields["product_name"] = _sheet_safe(body.name)
    if body.price is not None:
        fields["price"] = "" if _price(body.price) == 0 else body.price
    if body.condition is not None:
        fields["condition"] = _sheet_safe(body.condition)
    if body.size is not None:
        fields["size"] = _sheet_safe(body.size)
    if body.brand is not None:
        fields["brand"] = _sheet_safe(body.brand)
    if body.description is not None:
        fields["description"] = _sheet_safe(body.description)
    if body.pickupLocation is not None:
        fields["pickup_location"] = _sheet_safe(body.pickupLocation)
    if body.photos is not None:
        fields["image_url"] = _join_photos(body.photos)
    try:
        store.update_listing(category, listing_id, fields)
    except KeyError:
        raise HTTPException(404, "listing not found")
    df = store.read_tab(category)
    match = [r for r in df.to_dict("records") if _s(r.get("listing_id")) == listing_id]
    return listing_to_ts(match[0], category) if match else {"ok": True}


@app.delete("/api/listings/{category}/{listing_id}")
def delete_listing(category: str, listing_id: str, requesterEmail: str):
    _assert_owner(category, listing_id, requesterEmail)
    try:
        store.delete_listing(category, listing_id)
    except KeyError:
        raise HTTPException(404, "listing not found")
    return {"ok": True, "id": listing_id}
