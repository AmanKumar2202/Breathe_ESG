from math import radians, sin, cos, sqrt, atan2


def normalize_sap_unit(value, unit):

    unit = unit.upper()

    if unit == "L":
        return float(value), "litres"

    if unit == "GAL":
        return float(value) * 3.78541, "litres"

    if unit == "TO":
        return float(value) * 1000, "kg"

    if unit == "M3":
        return float(value), "m3"

    return float(value), unit.lower()


def normalize_utility_unit(value, unit):

    unit = unit.lower()

    if unit == "mwh":
        return float(value) * 1000, "kWh"

    if unit == "gj":
        return float(value) * 277.778, "kWh"

    if unit == "therms":
        return float(value) * 29.3, "kWh"

    if unit == "kwh":
        return float(value), "kWh"

    return float(value), unit


def haversine_distance(lat1, lon1, lat2, lon2):

    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c