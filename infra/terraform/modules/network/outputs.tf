output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.this.id
}

output "vpc_cidr_block" {
  description = "Address range of the VPC."
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets, one per availability zone."
  value       = [for az in var.availability_zones : aws_subnet.public[az].id]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets, one per availability zone."
  value       = [for az in var.availability_zones : aws_subnet.private[az].id]
}

output "flow_log_bucket" {
  description = "Name of the S3 bucket that receives VPC flow logs."
  value       = aws_s3_bucket.flow_logs.id
}
