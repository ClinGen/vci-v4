variable "name" {
  description = "Name of the VPC. Also the start of every other resource name in this module."
  type        = string
  default     = "vci-v4"
}

variable "cidr_block" {
  description = "IPv4 address range of the VPC, for example 10.40.0.0/16. Must not overlap other VPCs in the account."
  type        = string

  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "cidr_block must be an IPv4 CIDR, for example 10.40.0.0/16."
  }
}

variable "availability_zones" {
  description = "Availability zones to create subnets in, one public and one private subnet each. At least two: load balancers and RDS require it."
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "List at least two availability zones."
  }
}

variable "public_subnet_cidrs" {
  description = "Address range of each public subnet, in the same order as availability_zones. Each must be inside cidr_block."
  type        = list(string)

  validation {
    condition     = length(var.public_subnet_cidrs) == length(var.availability_zones)
    error_message = "Give one public subnet CIDR per availability zone."
  }
}

variable "private_subnet_cidrs" {
  description = "Address range of each private subnet, in the same order as availability_zones. Each must be inside cidr_block."
  type        = list(string)

  validation {
    condition     = length(var.private_subnet_cidrs) == length(var.availability_zones)
    error_message = "Give one private subnet CIDR per availability zone."
  }
}

variable "flow_log_retention_days" {
  description = "Days to keep VPC flow log files before S3 deletes them."
  type        = number
  default     = 90
}
