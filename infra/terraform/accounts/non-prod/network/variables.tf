variable "account_id" {
  description = "The non-prod AWS account ID. Terraform refuses to run against any other account. Set in terraform.tfvars, which Git ignores."
  type        = string

  validation {
    condition     = can(regex("^[0-9]{12}$", var.account_id))
    error_message = "account_id must be a 12-digit AWS account ID."
  }
}

variable "region" {
  description = "AWS region for the network."
  type        = string
  default     = "us-west-2"
}
