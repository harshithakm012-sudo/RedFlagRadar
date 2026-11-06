"""Risk aggregation for transparent heuristic estimates."""


def level_for(score: int) -> str:
    if score < 30:
        return "Low"
    if score < 60:
        return "Medium"
    return "High"


def score_findings(findings: list[dict]) -> int:
    """Combine distinct evidence codes, cap repeated instances, and clamp to 100."""
    best_by_code: dict[str, int] = {}
    for finding in findings:
        code = finding["code"]
        best_by_code[code] = max(best_by_code.get(code, 0), finding["points"])
    return min(100, sum(best_by_code.values()))

