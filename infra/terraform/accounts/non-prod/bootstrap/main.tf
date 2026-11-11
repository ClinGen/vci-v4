# Credentials come from AWS_PROFILE on each command (AWS_PROFILE=<your profile> terraform plan);
provider "aws" {
  region              = var.region
  allowed_account_ids = [var.account_id]

  default_tags {
    tags = {
      Project   = "vci-v4"
      ManagedBy = "terraform"
      Account   = "non-prod"
      Component = "terraform-state"
    }
  }
}

module "state_bucket" {
  source = "../../../modules/state-bucket"
}
