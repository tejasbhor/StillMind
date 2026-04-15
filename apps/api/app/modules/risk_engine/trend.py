def compute_trend(previous_cri: float, current_cri: float) -> str:
    """
    Computed by comparing current CRI score vs previous risk_log CRI score.
    Threshold: ±0.05 change = IMPROVING or WORSENING; within ±0.05 = STABLE.
    """
    diff = round(current_cri - previous_cri, 3)
    if diff >= 0.05:
        return "WORSENING"
    elif diff <= -0.05:
        return "IMPROVING"
    else:
        return "STABLE"
