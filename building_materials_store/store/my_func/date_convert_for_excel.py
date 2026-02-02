from datetime import datetime

def format_date_ru(date_str: str) -> str:
    """
    '2026-02-01' -> '01.02.2026'
    """
    return datetime.strptime(date_str, "%Y-%m-%d").strftime("%d.%m.%Y")