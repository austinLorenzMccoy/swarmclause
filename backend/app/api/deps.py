from functools import lru_cache

from app.core.config import get_settings
from app.services.groq import GroqNegotiationService
from app.services.hcs import HCSClient
from app.services.hedera_contract import HederaContractService
from app.services.simulation import SimulationService

settings = get_settings()


@lru_cache()
def _groq_service() -> GroqNegotiationService:
    return GroqNegotiationService(api_key=settings.groq_api_key)


def get_groq_service() -> GroqNegotiationService:
    return _groq_service()


@lru_cache()
def _simulation_service() -> SimulationService:
    return SimulationService()


def get_simulation_service() -> SimulationService:
    return _simulation_service()


@lru_cache()
def _hcs_client() -> HCSClient:
    return HCSClient(topic_id=settings.hedera_topic_id)


def get_hcs_client() -> HCSClient:
    return _hcs_client()


@lru_cache()
def _contract_service() -> HederaContractService:
    return HederaContractService(
        operator_id=settings.hedera_operator_id,
        operator_key=settings.hedera_operator_key,
    )


def get_contract_service() -> HederaContractService:
    return _contract_service()


__all__ = [
    "get_groq_service",
    "get_simulation_service",
    "get_hcs_client",
    "get_contract_service",
]
