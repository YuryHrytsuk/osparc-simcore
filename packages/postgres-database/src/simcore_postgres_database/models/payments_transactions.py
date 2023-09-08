import enum

import sqlalchemy as sa

from ._common import (
    column_created_datetime,
    column_modified_datetime,
    register_modified_datetime_auto_update_trigger,
)
from .base import metadata


@enum.unique
class PaymentTransactionState(str, enum.Enum):
    PENDING = "PENDING"  # payment initiated
    SUCCESS = "SUCCESS"  # payment completed with success
    FAILED = "FAILED"  # payment failed
    CANCELED = "CANCELED"  # payment explicitly aborted by user


payments_transactions = sa.Table(
    "payments_transactions",
    metadata,
    sa.Column(
        "payment_id",
        sa.String,
        nullable=False,
        primary_key=True,
        doc="Identifer of the payment provided by payment gateway",
    ),
    sa.Column(
        "price_dollars",
        sa.Numeric(scale=2),
        nullable=False,
        doc="Total amount of the transaction (in dollars). E.g. 1234.12 $",
    ),
    #
    # Concept/Info
    #
    sa.Column(
        "osparc_credits",
        sa.Numeric(scale=2),
        nullable=False,
        doc="Amount of credits that will be added to the wallet_id "
        "once the transaction completes successfuly."
        "E.g. 1234.12 credits",
    ),
    sa.Column(
        "product_name",
        sa.String,
        nullable=False,
        doc="Product name from which the transaction took place",
    ),
    sa.Column(
        "user_id",
        sa.BigInteger,
        nullable=False,
        doc="User unique identifier",
        index=True,
    ),
    sa.Column(
        "user_email",
        sa.String,
        nullable=False,
        doc="User email  at the time of the transaction",
    ),
    sa.Column(
        "wallet_id",
        sa.BigInteger,
        nullable=False,
        doc="Wallet identifier owned by the user",
        index=True,
    ),
    sa.Column(
        "comment",
        sa.Text,
        nullable=True,
        doc="Extra comment on this payment (optional)",
    ),
    #
    # States
    #
    sa.Column(
        "initiated_at",
        sa.DateTime(timezone=True),
        nullable=False,
        doc="Timestamps when transaction initated (successful respose to /init)",
    ),
    sa.Column(
        "completed_at",
        sa.DateTime(timezone=True),
        nullable=True,
        doc="Timestamps when transaction completed (payment acked)",
    ),
    sa.Column(
        "state",
        sa.Enum(PaymentTransactionState),
        nullable=False,
        default=PaymentTransactionState.PENDING,
        doc="A transaction goes through through multiple states. "
        "When initiated state=PENDING and is completed with SUCCESS/FAILURE/CANCELED",
    ),
    sa.Column(
        "state_message",
        sa.Text,
        nullable=True,
        doc="State message to with details on the state e.g. failure messages",
    ),
    # timestamps for this row
    column_created_datetime(timezone=True),
    column_modified_datetime(timezone=True),
)


register_modified_datetime_auto_update_trigger(payments_transactions)
