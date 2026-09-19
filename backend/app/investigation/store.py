from ..domain.models import Investigation

class InvestigationStore:
    def __init__(self): self._items: dict[str, Investigation] = {}
    def save(self, item: Investigation): self._items[item.id] = item; return item
    def get(self, investigation_id: str): return self._items.get(investigation_id)

store = InvestigationStore()
