output "ecr_repository_url" {
  description = "Address to push API images to."
  value       = aws_ecr_repository.api.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster."
  value       = aws_ecs_cluster.this.name
}

output "db_instance_identifier" {
  description = "Identifier of the Postgres server."
  value       = aws_db_instance.this.identifier
}

output "db_admin_secret_arn" {
  description = "ARN of the Secrets Manager secret RDS created for the admin login."
  value       = aws_db_instance.this.master_user_secret[0].secret_arn
}

output "load_balancer_name" {
  description = "Name of the internal load balancer."
  value       = aws_lb.this.name
}

output "vpc_origin_parameter" {
  description = "SSM parameter holding the CloudFront VPC origin ID."
  value       = aws_ssm_parameter.vpc_origin_id.name
}
