from fastapi import APIRouter
from models_library.api_schemas__common.meta import BaseMeta
from models_library.basic_types import VersionStr

from ..._meta import API_VERSION, API_VTAG

router = APIRouter()


@router.get("", response_model=BaseMeta)
async def get_service_metadata() -> BaseMeta:
    return BaseMeta(
        name=__name__.split(".")[0],
        version=VersionStr(API_VERSION),
        released={API_VTAG: VersionStr(API_VERSION), "v0": VersionStr("0.1.0")},
    )
