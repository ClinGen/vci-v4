output "ecr_repository_url" {
  description = "Address to push API images to."
  value       = module.shared.ecr_repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster."
  value       = module.shared.ecs_cluster_name
}

output "db_instance_identifier" {
  description = "Identifier of the Postgres server."
  value       = module.shared.db_instance_identifier
}

output "db_admin_secret_arn" {
  description = "Secrets Manager secret holding the database admin login."
  value       = module.shared.db_admin_secret_arn
}

output "load_balancer_name" {
  description = "Name of the internal load balancer."
  value       = module.shared.load_balancer_name
}

output "vpc_origin_parameter" {
  description = "SSM parameter holding the CloudFront VPC origin ID."
  value       = module.shared.vpc_origin_parameter
}
