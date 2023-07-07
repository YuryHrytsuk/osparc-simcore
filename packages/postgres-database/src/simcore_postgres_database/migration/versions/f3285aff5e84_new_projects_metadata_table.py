"""new projects_metadata table

Revision ID: f3285aff5e84
Revises: 58b24613c3f7
Create Date: 2023-07-05 15:06:56.003418+00:00

"""
from typing import Final

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "f3285aff5e84"
down_revision = "58b24613c3f7"
branch_labels = None
depends_on = None


# auto-update modified
# TRIGGERS ------------------------
_TABLE_NAME: Final[str] = "projects_metadata"
_TRIGGER_NAME: Final[str] = "trigger_auto_update"  # NOTE: scoped on table
_PROCEDURE_NAME: Final[
    str
] = f"{_TABLE_NAME}_auto_update_modified()"  # NOTE: scoped on database
modified_timestamp_trigger = sa.DDL(
    f"""
DROP TRIGGER IF EXISTS {_TRIGGER_NAME} on {_TABLE_NAME};
CREATE TRIGGER {_TRIGGER_NAME}
BEFORE INSERT OR UPDATE ON {_TABLE_NAME}
FOR EACH ROW EXECUTE PROCEDURE {_PROCEDURE_NAME};
    """
)

# PROCEDURES ------------------------
update_modified_timestamp_procedure = sa.DDL(
    f"""
CREATE OR REPLACE FUNCTION {_PROCEDURE_NAME}
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified := current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
    """
)


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "projects_metadata",
        sa.Column("project_uuid", sa.String(), nullable=False),
        sa.Column(
            "custom",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "modified",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["project_uuid"],
            ["projects.uuid"],
            name="fk_projects_metadata_project_uuid",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("project_uuid"),
    )
    # ### end Alembic commands ###

    # custom
    op.execute(update_modified_timestamp_procedure)
    op.execute(modified_timestamp_trigger)


def downgrade():
    # custom
    op.execute(f"DROP TRIGGER IF EXISTS {_TRIGGER_NAME} on {_TABLE_NAME};")
    op.execute(f"DROP FUNCTION {_PROCEDURE_NAME};")

    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("projects_metadata")
    # ### end Alembic commands ###
