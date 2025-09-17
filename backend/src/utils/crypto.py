import os
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv


ENV_FILE_PATH = os.path.join(os.getcwd(), ".env")


def _load_env() -> None:
    try:
        load_dotenv(ENV_FILE_PATH)
    except Exception:
        # best-effort
        pass


def ensure_encryption_key() -> str:
    """Ensure ENCRYPTION_KEY exists in environment or .env. Returns the key."""
    _load_env()
    key = os.getenv("ENCRYPTION_KEY")
    if key and isinstance(key, str) and len(key.strip()) > 0:
        return key
    # generate and persist
    new_key = Fernet.generate_key().decode("utf-8")
    try:
        # append to .env to avoid overwriting other vars
        with open(ENV_FILE_PATH, "a", encoding="utf-8") as f:
            if os.path.getsize(ENV_FILE_PATH) > 0:
                f.write("\n")
            f.write(f"ENCRYPTION_KEY={new_key}\n")
    except Exception:
        # fallback: set into process only
        os.environ["ENCRYPTION_KEY"] = new_key
    return new_key


def _get_fernet() -> Fernet:
    _load_env()
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        key = ensure_encryption_key()
    return Fernet(key.encode("utf-8"))


def encrypt_str(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    f = _get_fernet()
    token = f.encrypt(value.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_str(token: Optional[str]) -> Optional[str]:
    if token is None:
        return None
    f = _get_fernet()
    try:
        value = f.decrypt(token.encode("utf-8"))
        return value.decode("utf-8")
    except (InvalidToken, Exception):
        return None


