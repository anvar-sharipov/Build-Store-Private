from datetime import datetime
"""
'2026-02-01' -> datetime.date(2026, 2, 1)
"""

def date_str_to_dateFormat(date_str):
    return datetime.strptime(date_str, "%Y-%m-%d").date()