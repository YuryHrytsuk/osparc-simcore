import logging
from uuid import UUID

from models_library.computations import CollectionRunID
from pydantic import TypeAdapter
from simcore_postgres_database.models.comp_runs_collections import comp_runs_collections
from sqlalchemy import func

from ._comp_runs_collections_models import CompRunCollectionDBGet

_logger = logging.getLogger(__name__)


# Comp run collections CRUD operations


async def create_comp_run_collection(
    conn,
    client_or_system_generated_id: str,
    client_or_system_generated_display_name: str,
    is_generated_by_system: bool,
) -> CollectionRunID:
    """Create a new computational run collection."""
    result = await conn.execute(
        comp_runs_collections.insert()
        .values(
            client_or_system_generated_id=client_or_system_generated_id,
            client_or_system_generated_display_name=client_or_system_generated_display_name,
            is_generated_by_system=is_generated_by_system,
            created=func.now(),
            modified=func.now(),
        )
        .returning(comp_runs_collections.c.collection_run_id)
    )
    collection_id_tuple: tuple[UUID] = result.one()
    return TypeAdapter(CollectionRunID).validate_python(collection_id_tuple[0])


async def get_comp_run_collection_or_none_by_id(
    conn, collection_run_id: CollectionRunID
) -> CompRunCollectionDBGet | None:
    result = await conn.execute(
        comp_runs_collections.select().where(
            comp_runs_collections.c.collection_run_id == f"{collection_run_id}"
        )
    )
    row = result.one_or_none()
    if row is None:
        return None
    return CompRunCollectionDBGet.model_validate(row)


async def get_comp_run_collection_or_none_by_client_generated_id(
    conn, client_or_system_generated_id: str
) -> CompRunCollectionDBGet | None:
    result = await conn.execute(
        comp_runs_collections.select().where(
            comp_runs_collections.c.client_or_system_generated_id
            == client_or_system_generated_id
        )
    )
    row = result.one_or_none()
    if row is None:
        return None
    return CompRunCollectionDBGet.model_validate(row)
