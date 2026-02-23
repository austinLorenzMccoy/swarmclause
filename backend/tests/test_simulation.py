from app.services.simulation import SimulationService


def test_simulation_service_confidence_levels():
    service = SimulationService()
    low_risk = service.evaluate_terms({"price": 100, "delivery_days": 3, "penalty": 30})
    assert low_risk["confidence"] == "HIGH"

    medium_risk = service.evaluate_terms({"price": 400, "delivery_days": 6, "penalty": 20})
    assert medium_risk["confidence"] in {"MEDIUM", "LOW"}

    high_risk = service.evaluate_terms({"price": 800, "delivery_days": 8, "penalty": 0})
    assert high_risk["confidence"] == "LOW"
