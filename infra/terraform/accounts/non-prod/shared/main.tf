# Credentials come from AWS_PROFILE on each command (AWS_PROFILE=<your profile> terraform plan).
provider "aws" {
  region              = var.region
  allowed_account_ids = [var.account_id]

  default_tags {
    tags = {
      Project   = "vci-v4"
      ManagedBy = "terraform"
      Account   = "non-prod"
      Component = "shared"
    }
  }
}

# Resources every stack in this account uses. Needs the network folder applied first.
module "shared" {
  source = "../../../modules/shared"

  name              = "vci-v4"
  db_instance_class = "db.t4g.micro"
}
