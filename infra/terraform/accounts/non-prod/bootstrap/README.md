# non-prod / bootstrap

Creates the non-prod account's Terraform state bucket, using [`modules/state-bucket`](../../../modules/state-bucket). Every other Terraform folder in the non-prod account keeps its state in this bucket.

This folder runs once per account. **It already exists for non-prod**, so you normally only need it to look up the bucket name.

## Files

| File | Purpose |
|---|---|
| `main.tf` | AWS provider (region, account guard, tags) and the state bucket module |
| `variables.tf` | `account_id` (required) and `region` (default `us-west-2`) |
| `outputs.tf` | `state_bucket`, the bucket name |
| `backend.tf` | Stores this folder's own state in the bucket it created |
| `terraform.tfvars.example` | Copy to `terraform.tfvars` and set the non-prod account ID |

## Using it on a new machine

```bash
cd infra/terraform/accounts/non-prod/bootstrap
cp terraform.tfvars.example terraform.tfvars      # set account_id
cp ../backend.hcl.example ../backend.hcl          # set bucket (ask a teammate, or see the S3 console)
AWS_PROFILE=<your profile> terraform init -backend-config=../backend.hcl
AWS_PROFILE=<your profile> terraform plan         # expect "No changes"
```

## Setting up a new account

The first run in a new account has to create the bucket before state can be stored in it, so `backend.tf` starts commented out and the state is moved into the bucket afterwards. See "Step 1: State bucket" in [docs/deploy.md](../../../../../docs/deploy.md).
