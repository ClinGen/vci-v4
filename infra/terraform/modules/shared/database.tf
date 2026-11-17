# One Postgres server per account. Each stack gets its own database and login on it,
# created by the stack's setup command, not by Terraform.

resource "aws_db_subnet_group" "this" {
  name        = var.name
  description = "Private subnets for the ${var.name} Postgres server"
  subnet_ids  = data.aws_subnets.private.ids
}

resource "aws_db_parameter_group" "postgres" {
  name        = "${var.name}-postgres18"
  family      = "postgres18"
  description = "Postgres settings for ${var.name}"

  parameter {
    name         = "rds.force_ssl"
    value        = "1" # Refuse unencrypted connections
    apply_method = "pending-reboot"
  }

  parameter {
    name  = "log_statement"
    value = "ddl" # Log schema changes (CREATE, ALTER, DROP)
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries slower than 1 second
  }

  lifecycle {
    create_before_destroy = true
  }
}

# RDS writes Postgres logs to this group. Created here so it has a retention period;
# RDS would otherwise create it with logs kept forever.
resource "aws_cloudwatch_log_group" "postgres" {
  #checkov:skip=CKV_AWS_158:CloudWatch Logs encrypts log data by default; a customer-managed KMS key adds cost without a requirement.
  #checkov:skip=CKV_AWS_338:Database logs are for debugging; log_retention_days sets how long they're kept.
  name              = "/aws/rds/instance/${var.name}/postgresql"
  retention_in_days = var.log_retention_days
}

resource "aws_db_instance" "this" {
  #checkov:skip=CKV_AWS_118:Enhanced Monitoring is billed separately; standard CloudWatch metrics are enough for now.
  #checkov:skip=CKV_AWS_161:Stacks sign in with their own database login, stored in Secrets Manager.
  #checkov:skip=CKV_AWS_353:Performance Insights is not needed at this size; revisit if queries need tuning.
  #checkov:skip=CKV_AWS_354:Performance Insights is off, so there is nothing to encrypt.
  #checkov:skip=CKV_AWS_157:Multi-AZ is set by db_multi_az for each account.
  identifier     = var.name
  engine         = "postgres"
  engine_version = "18" # RDS picks the current 18.x release and applies minor updates in the maintenance window
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  # RDS creates the admin password and keeps it in Secrets Manager, rotating it on a schedule.
  # It never appears in Terraform code or state.
  username                    = "vci_admin"
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  multi_az               = var.db_multi_az
  parameter_group_name   = aws_db_parameter_group.postgres.name

  backup_retention_period    = var.db_backup_retention_days
  backup_window              = "09:00-09:30"         # UTC, early morning in the US
  maintenance_window         = "sun:10:00-sun:10:30" # UTC
  auto_minor_version_upgrade = true
  copy_tags_to_snapshot      = true

  enabled_cloudwatch_logs_exports = ["postgresql"]

  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.name}-final"

  depends_on = [aws_cloudwatch_log_group.postgres]

  lifecycle {
    prevent_destroy = true
  }
}
