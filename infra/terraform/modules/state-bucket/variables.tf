variable "name_prefix" {
  description = "Prefix for the bucket name. The account ID and region are appended to make it globally unique."
  type        = string
  default     = "vci-v4"
}

variable "noncurrent_version_retention_days" {
  description = "How long to keep superseded versions of state files, for recovery."
  type        = number
  default     = 90
}
