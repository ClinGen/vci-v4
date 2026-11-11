# State lives in the bucket this folder created. The bucket name comes from ../backend.hcl:
#   AWS_PROFILE=<your profile> terraform init -backend-config=../backend.hcl
# (For a new account, this block starts commented out: the first apply creates the bucket. See docs/deploy.md, step 1.)

terraform {
  backend "s3" {
    key          = "accounts/non-prod/bootstrap/terraform.tfstate"
    region       = "us-west-2"
    encrypt      = true
    use_lockfile = true
  }
}
