
# warehouse и categories у тебя приходят строкой вида '1,2', '2,3'.
# Их нужно превратить в list, чтобы нормально использовать в __in.

def str_to_int_list(value: str):
    if not value:
        return []
    return [int(v) for v in value.split(",") if v.isdigit()]