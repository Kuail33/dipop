"""Backend config: read the same secrets.toml the Streamlit app used.

No Streamlit dependency. Reads [connections.gsheets] (service account + sheet
URL) and [cloudinary] from ../.streamlit/secrets.toml.
"""
import functools
import pathlib

try:
    import tomllib  # Python 3.11+
except ModuleNotFoundError:  # pragma: no cover
    import tomli as tomllib  # Python 3.10 fallback

_SECRETS_PATH = pathlib.Path(__file__).resolve().parent.parent / ".streamlit" / "secrets.toml"


@functools.lru_cache(maxsize=1)
def _secrets() -> dict:
    with open(_SECRETS_PATH, "rb") as f:
        return tomllib.load(f)


def gsheets_section() -> dict:
    return dict(_secrets()["connections"]["gsheets"])


def spreadsheet_url() -> str:
    return _secrets()["connections"]["gsheets"]["spreadsheet"]


def cloudinary_section() -> dict:
    return dict(_secrets()["cloudinary"])
