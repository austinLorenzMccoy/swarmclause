from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class HCSClient:
    topic_id: str | None = None

    def publish_message(self, session_id: str, payload: Dict[str, Any]) -> None:
        """Placeholder for Hedera Consensus Service publish operation."""
        if not self.topic_id:
            # In MVP, simply log to stdout or ignore when no topic configured.
            print(f"[HCS:dry-run] session={session_id} payload={payload}")
            return

        # TODO: integrate with Hedera SDK and send to actual topic
        print(
            f"[HCS:send] topic={self.topic_id} session={session_id} payload={payload}"
        )
