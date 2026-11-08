"""Data + image logic, ported from the Streamlit app's dataset.py/images.py.

Reads use the public gviz CSV endpoint (no credentials). Writes use the Google
service account via gspread. Images go to Cloudinary. Same behavior as before,
just reading secrets from config instead of st.secrets.
"""
import re
from datetime import date

import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
import cloudinary
import cloudinary.uploader

from . import config

SECTIONS = ("marketplace", "food_corner", "gatr")
_ID_PREFIX = {"marketplace": "L", "food_corner": "F", "gatr": "G"}
_SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


def _spreadsheet_id() -> str:
    url = config.spreadsheet_url()
    m = re.search(r"/d/([a-zA-Z0-9-_]+)", url)
    if not m:
        raise ValueError(f"No spreadsheet id in {url!r}")
    return m.group(1)


def read_tab(section: str) -> pd.DataFrame:
    sheet_id = _spreadsheet_id()
    csv_url = (
        f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq"
        f"?tqx=out:csv&sheet={section}"
    )
    df = pd.read_csv(csv_url)
    df = df.dropna(how="all").reset_index(drop=True)
    for col in ("price", "original_price"):
        if col in df.columns:
            cleaned = df[col].astype(str).str.replace(r"[^0-9.]", "", regex=True)
            df[col] = pd.to_numeric(cleaned.replace("", pd.NA), errors="coerce")
    return df


_client = None


def _gspread_client() -> gspread.Client:
    global _client
    if _client is None:
        creds_dict = config.gsheets_section()
        creds_dict.pop("spreadsheet", None)
        creds = Credentials.from_service_account_info(creds_dict, scopes=_SCOPES)
        _client = gspread.authorize(creds)
    return _client


def _worksheet(section: str) -> gspread.Worksheet:
    return _gspread_client().open_by_key(_spreadsheet_id()).worksheet(section)


def _next_listing_id(ws: gspread.Worksheet, section: str) -> str:
    prefix = _ID_PREFIX[section]
    existing = ws.col_values(1)[1:]
    nums = [
        int(v[len(prefix):])
        for v in existing
        if v.startswith(prefix) and v[len(prefix):].isdigit()
    ]
    return f"{prefix}{(max(nums) + 1) if nums else 1:02d}"


def add_listing(section: str, row: dict) -> str:
    ws = _worksheet(section)
    header = ws.row_values(1)
    full = {
        **row,
        "listing_id": _next_listing_id(ws, section),
        "date_post": date.today().isoformat(),
        "status": "Available",
    }
    values = [str(full.get(col, "") or "") for col in header]
    ws.append_row(values, value_input_option="USER_ENTERED")
    return full["listing_id"]


def _find_row(ws, header, listing_id):
    id_col = header.index("listing_id") + 1
    cell = ws.find(str(listing_id), in_column=id_col)
    if cell is None:
        raise KeyError(listing_id)
    return cell.row


def set_status(section: str, listing_id: str, new_status: str) -> None:
    ws = _worksheet(section)
    header = ws.row_values(1)
    row = _find_row(ws, header, listing_id)
    ws.update_cell(row, header.index("status") + 1, new_status)


def update_listing(section: str, listing_id: str, fields: dict) -> None:
    ws = _worksheet(section)
    header = ws.row_values(1)
    row = _find_row(ws, header, listing_id)
    for key, val in fields.items():
        if key in header:
            ws.update_cell(row, header.index(key) + 1, str(val if val is not None else ""))


def delete_listing(section: str, listing_id: str) -> None:
    ws = _worksheet(section)
    header = ws.row_values(1)
    row = _find_row(ws, header, listing_id)
    ws.delete_rows(row)


def upload_image(fileobj) -> str:
    c = config.cloudinary_section()
    cloudinary.config(
        cloud_name=c["cloud_name"],
        api_key=c["api_key"],
        api_secret=c["api_secret"],
        secure=True,
    )
    return cloudinary.uploader.upload(fileobj, folder="dipop")["secure_url"]
