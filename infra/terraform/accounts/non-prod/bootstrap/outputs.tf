output "state_bucket" {
  description = "State bucket name. Put it in ../backend.hcl for every Terraform folder in this account."
  value       = module.state_bucket.bucket_name
}
