from datetime import date
from uuid import uuid4

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import create_access_token
from app.models.item import ClothingItem, ItemStatus
from app.models.outfit import (
    Outfit,
    OutfitItem,
    OutfitSource,
    OutfitStatus,
)
from app.models.user import User


def _make_item(user_id, item_type="shirt", **kwargs) -> ClothingItem:
    return ClothingItem(
        user_id=user_id,
        type=item_type,
        image_path=f"test/{uuid4()}.jpg",
        status=ItemStatus.ready,
        **kwargs,
    )


def _make_pairing(user_id, items: list[ClothingItem], source_item=None) -> Outfit:
    outfit = Outfit(
        user_id=user_id,
        occasion="casual",
        scheduled_for=date.today(),
        status=OutfitStatus.pending,
        source=OutfitSource.pairing,
        source_item_id=source_item.id if source_item else None,
        reasoning="Test pairing",
    )
    for i, item in enumerate(items):
        outfit_item = OutfitItem(
            item_id=item.id,
            position=i,
        )
        outfit.items.append(outfit_item)
    return outfit


@pytest.fixture
def second_user_factory():
    def _make():
        uid = uuid4()
        return User(
            id=uid,
            external_id=f"test-user-{uid}",
            email=f"test-{uid}@example.com",
            display_name="Second User",
            timezone="UTC",
            is_active=True,
            onboarding_completed=False,
        )

    return _make


class TestListPairings:
    @pytest.mark.asyncio
    async def test_list_pairings_empty(self, client: AsyncClient, test_user, auth_headers):
        response = await client.get("/api/v1/pairings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["pairings"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_list_pairings_returns_data(
        self, client: AsyncClient, test_user, auth_headers, db_session: AsyncSession
    ):
        item1 = _make_item(test_user.id, "shirt")
        item2 = _make_item(test_user.id, "pants")
        db_session.add_all([item1, item2])
        await db_session.flush()

        pairing = _make_pairing(test_user.id, [item1, item2], source_item=item1)
        db_session.add(pairing)
        await db_session.commit()

        response = await client.get("/api/v1/pairings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["pairings"]) == 1
        assert data["pairings"][0]["source"] == "pairing"
        assert len(data["pairings"][0]["items"]) == 2

class TestDeletePairing:
    @pytest.mark.asyncio
    async def test_delete_own_pairing(
        self, client: AsyncClient, test_user, auth_headers, db_session: AsyncSession
    ):
        item = _make_item(test_user.id)
        db_session.add(item)
        await db_session.flush()

        pairing = _make_pairing(test_user.id, [item])
        db_session.add(pairing)
        await db_session.commit()

        response = await client.delete(f"/api/v1/pairings/{pairing.id}", headers=auth_headers)
        assert response.status_code == 204

        # Verify deleted
        response = await client.get("/api/v1/pairings", headers=auth_headers)
        assert response.json()["total"] == 0

    @pytest.mark.asyncio
    async def test_cannot_delete_other_users_pairing(
        self, client: AsyncClient, test_user, auth_headers, db_session: AsyncSession
    ):
        other_user = User(
            id=uuid4(),
            external_id=f"other-{uuid4()}",
            email=f"other-{uuid4()}@example.com",
            display_name="Other",
            timezone="UTC",
            is_active=True,
        )
        db_session.add(other_user)
        await db_session.flush()

        item = _make_item(other_user.id)
        db_session.add(item)
        await db_session.flush()

        pairing = _make_pairing(other_user.id, [item])
        db_session.add(pairing)
        await db_session.commit()

        response = await client.delete(f"/api/v1/pairings/{pairing.id}", headers=auth_headers)
        assert response.status_code == 404
