from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class GroqNegotiationService:
    api_key: str | None = None

    def propose_counter_offer(
        self,
        role: str,
        last_offer: Dict[str, Any] | None,
        target_price: int | None = None,
        target_delivery: int | None = None,
    ) -> Dict[str, Any]:
        """Stub Groq integration that heuristically adjusts offers."""

        if last_offer is None:
            return {
                "price": target_price or 250,
                "delivery_days": target_delivery or 5,
                "penalty": 25,
                "escrow": True,
            }

        adjustment = -10 if role.lower().startswith("buyer") else 10
        price = max(0, last_offer.get("price", 250) + adjustment)
        delivery = last_offer.get("delivery_days", 5)

        if target_delivery is not None:
            delivery = min(delivery, target_delivery)

        return {
            "price": price,
            "delivery_days": delivery,
            "penalty": last_offer.get("penalty", 20),
            "escrow": last_offer.get("escrow", True),
        }
