output "bucket_name" {
  description = "Name of the state bucket, for backend configuration."
  value       = aws_s3_bucket.state.bucket
}

output "bucket_arn" {
  description = "ARN of the state bucket, for IAM policies (for example the CI deploy role)."
  value       = aws_s3_bucket.state.arn
}
