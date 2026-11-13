# Credentials come from AWS_PROFILE on each command (AWS_PROFILE=<your profile> terraform plan).
provider "aws" {
  region              = var.region
  allowed_account_ids = [var.account_id]

  default_tags {
    tags = {
      Project   = "vci-v4"
      ManagedBy = "terraform"
      Account   = "non-prod"
      Component = "network"
    }
  }
}

# The vci-v4 VPC, shared by every stack in this account.
# 10.40.0.0/16 doesn't overlap the account's other VPCs. The prod account uses 10.41.0.0/16.
module "network" {
  source = "../../../modules/network"

  name               = "vci-v4"
  cidr_block         = "10.40.0.0/16"
  availability_zones = ["${var.region}a", "${var.region}b"]

  # One /20 (4,096 addresses) per subnet. 10.40.64.0 and up is left free.
  public_subnet_cidrs  = ["10.40.0.0/20", "10.40.16.0/20"]  # API containers
  private_subnet_cidrs = ["10.40.32.0/20", "10.40.48.0/20"] # database, internal load balancer
}
