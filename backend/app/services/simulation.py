from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class SimulationService:
    """Runs contract stress tests before deployment."""

    def evaluate_terms(self, terms: Dict[str, Any]) -> Dict[str, Any]:
        price = terms.get("price", 250)
        delivery_days = terms.get("delivery_days", 5)
        penalty = terms.get("penalty", 25) or 0

        risk_score = self._calculate_risk(price, delivery_days, penalty)
        recommendation = max(penalty, int(price * 0.1))

        return {
            "risk_score": round(risk_score, 2),
            "recommended_penalty": recommendation,
            "confidence": self._confidence_bucket(risk_score),
        }

    @staticmethod
    def _calculate_risk(price: int, delivery_days: int, penalty: int) -> float:
        base = 0.5 if delivery_days > 5 else 0.25
        price_factor = min(price / 1000, 0.3)
        penalty_factor = 0.1 if penalty >= price * 0.1 else 0.25
        return base + price_factor - penalty_factor

    @staticmethod
    def _confidence_bucket(score: float) -> str:
        if score <= 0.25:
            return "HIGH"
        if score <= 0.5:
            return "MEDIUM"
        return "LOW"
