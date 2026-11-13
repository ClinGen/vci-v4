output "vpc_id" {
  description = "ID of the vci-v4 VPC."
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnets, for the API containers."
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnets, for the database and internal load balancer."
  value       = module.network.private_subnet_ids
}

output "flow_log_bucket" {
  description = "S3 bucket that receives this VPC's flow logs."
  value       = module.network.flow_log_bucket
}
