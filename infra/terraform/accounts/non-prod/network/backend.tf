# State lives in the account's state bucket. The bucket name comes from ../backend.hcl:
#   AWS_PROFILE=<your profile> terraform init -backend-config=../backend.hcl

terraform {
  backend "s3" {
    key          = "accounts/non-prod/network/terraform.tfstate"
    region       = "us-west-2"
    encrypt      = true
    use_lockfile = true
  }
}
