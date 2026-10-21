from alembic import command


def test_migrations_downgrade_and_upgrade_cleanly(alembic_cfg):
    command.downgrade(alembic_cfg, "base")
    command.upgrade(alembic_cfg, "head")


def test_models_match_migrations(alembic_cfg):
    """Fails when a model changed but nobody generated a migration for it."""
    command.check(alembic_cfg)
