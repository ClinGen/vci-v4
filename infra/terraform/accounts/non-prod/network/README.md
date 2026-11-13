# non-prod / network

Creates the `vci-v4` VPC for the non-prod account, using [`modules/network`](../../../modules/network). Every v4 stack in this account runs inside it.

## Files

| File | Purpose |
|---|---|
| `main.tf` | AWS provider (region, account guard, tags) and the network module with this account's address ranges |
| `variables.tf` | `account_id` (required) and `region` (default `us-west-2`) |
| `outputs.tf` | VPC ID, subnet IDs, flow log bucket name |
| `backend.tf` | Stores this folder's state in the account's state bucket |
| `terraform.tfvars.example` | Copy to `terraform.tfvars` and set the non-prod account ID |

## Running it

```bash
cd infra/terraform/accounts/non-prod/network
cp terraform.tfvars.example terraform.tfvars      # set account_id
AWS_PROFILE=<your profile> terraform init -backend-config=../backend.hcl
AWS_PROFILE=<your profile> terraform plan
```

`../backend.hcl` holds the state bucket name; see [bootstrap](../bootstrap). First-time setup is "Step 2: Network" in [docs/deploy.md](../../../../../docs/deploy.md).

## Finding the network from other folders

Other folders look the network up instead of reading this folder's state:

```hcl
data "aws_vpc" "main" {
  tags = { Name = "vci-v4" }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  tags = { Tier = "private" }
}
```
