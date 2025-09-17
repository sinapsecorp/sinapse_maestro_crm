from __future__ import annotations

from typing import Optional, Tuple


MAX_PAGE_SIZE: int = 50


def normalize_pagination(
    *,
    page: Optional[int] = None,
    page_size: Optional[int] = None,
    skip: Optional[int] = 0,
    limit: Optional[int] = None,
) -> Tuple[int, int]:
    """Return (skip, limit) clamped to a maximum page size.

    - Prefers page/page_size when provided; falls back to skip/limit.
    - Enforces 1 <= page_size <= MAX_PAGE_SIZE.
    - Non-negative skip.
    """
    # Determine desired page size
    if page_size is not None:
        ps = max(1, min(int(page_size), MAX_PAGE_SIZE))
    elif limit is not None:
        ps = max(1, min(int(limit), MAX_PAGE_SIZE))
    else:
        ps = MAX_PAGE_SIZE

    # Compute skip
    if page is not None and int(page) > 0:
        s = (int(page) - 1) * ps
    else:
        s = max(0, int(skip or 0))

    return s, ps


