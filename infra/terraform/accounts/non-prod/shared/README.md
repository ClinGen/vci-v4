# non-prod / shared

Creates the resources every v4 stack in the non-prod account uses (image registry, container cluster, Postgres server, internal load balancer), using [`modules/shared`](../../../modules/shared).

Apply [`network`](../network) first; this folder looks the VPC up by name.

## Files

| File | Purpose |
|---|---|
| `main.tf` | AWS provider (region, account guard, tags) and the shared module with this account's sizes |
| `variables.tf` | `account_id` (required) and `region` (default `us-west-2`) |
| `outputs.tf` | Registry address, cluster, database and load balancer names |
| `backend.tf` | Stores this folder's state in the account's state bucket |
| `terraform.tfvars.example` | Copy to `terraform.tfvars` and set the non-prod account ID |

## Running it

```bash
cd infra/terraform/accounts/non-prod/shared
cp terraform.tfvars.example terraform.tfvars      # set account_id
AWS_PROFILE=<your profile> terraform init -backend-config=../backend.hcl
AWS_PROFILE=<your profile> terraform plan
```

First-time setup is "Step 3: Shared resources" in [docs/deploy.md](../../../../../docs/deploy.md).
