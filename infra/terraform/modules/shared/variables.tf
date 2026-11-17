variable "name" {
  description = "Name of the account's VPC (from the network folder), and the start of every resource name in this module."
  type        = string
  default     = "vci-v4"
}

variable "db_instance_class" {
  description = "RDS instance size, for example db.t4g.micro."
  type        = string
}

variable "db_allocated_storage" {
  description = "Starting database storage, in GB."
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Most storage RDS may grow to on its own, in GB."
  type        = number
  default     = 100
}

variable "db_multi_az" {
  description = "Keep a standby copy of the database in a second availability zone."
  type        = bool
  default     = false
}

variable "db_backup_retention_days" {
  description = "Days to keep automated database backups."
  type        = number
  default     = 7
}

variable "log_retention_days" {
  description = "Days to keep database logs in CloudWatch."
  type        = number
  default     = 30
}

variable "image_retention_count" {
  description = "Number of most recent API images to keep in the registry. Older ones are deleted, so keep this above the number of images any running stack could still be using."
  type        = number
  default     = 100
}
