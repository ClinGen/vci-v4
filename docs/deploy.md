# Deploying VCI v4 to AWS

The Terraform code lives in `infra/terraform`. Deploys to AWS by following the steps below.

## Layout

```
infra/terraform/
  modules/              Reusable building blocks (state bucket, network, stack)
  accounts/<account>/   Things that exist once per AWS account (state bucket, vci-v4 VPC)
  envs/<stack>/         One folder per stack (dev, curation-test, prod)
```

Each folder you run Terraform in has its own state, so working in one can never change another.

Two files per account stay on your machine and are ignored by Git. Copy them from their `.example` versions:

| File | Holds |
|------|-------|
| `accounts/<account>/bootstrap/terraform.tfvars` | The account ID. Terraform refuses to run against any other account |
| `accounts/<account>/backend.hcl` | The state bucket name, used by every folder in that account |

## Before you start

1. **Install the tools:**
   ```bash
   brew tap hashicorp/tap && brew install hashicorp/tap/terraform
   brew install awscli
   ```
3. **Check:** `terraform version` shows 1.17.1 or later, and `aws --version` prints a version.

## Choosing the account (on every command)

Terraform uses the same AWS CLI profiles as v3's Serverless's `--aws-profile`. Name the profile on **each command** by putting `AWS_PROFILE=<profile>` in front of it, the way you'd pass `--aws-profile` to Serverless:

```bash
AWS_PROFILE=non-prod aws sts get-caller-identity
AWS_PROFILE=non-prod terraform plan
```

The commands below use `non-prod`. **Replace it with whatever your non-prod profile is called** on your machine. Profile names aren't stored anywhere in the repo.

`get-caller-identity` prints the `Account` the profile points at. Confirm it's the non-prod account before going further.


If you forget `AWS_PROFILE=` on a command, Terraform falls back to your default profile, and the safety net stops it. Each account folder refuses to run unless the profile's account matches the `account_id` in its `terraform.tfvars`, so you'll see `AWS account ID not allowed` rather than a change to the wrong account.

## Step 1: Creating a State bucket (non-prod S3 example)

Creates the private S3 bucket where Terraform keeps state for everything in the non-prod account.

1. **Go to the folder and set the account ID:**
   ```bash
   cd infra/terraform/accounts/non-prod/bootstrap
   cp terraform.tfvars.example terraform.tfvars
   ```
   Edit `terraform.tfvars` and set `account_id` to the `Account` value from `AWS_PROFILE=non-prod aws sts get-caller-identity`.

2. **Initialize:**
   ```bash
   AWS_PROFILE=non-prod terraform init
   ```
   Expect `Installed hashicorp/aws v6.69.1 (signed by HashiCorp)` and `Terraform has been successfully initialized!`

3. **Preview.** Nothing is created yet:
   ```bash
   AWS_PROFILE=non-prod terraform plan -out=bootstrap.tfplan
   ```
   Expect exactly **`Plan: 7 to add, 0 to change, 0 to destroy.`** The seven resources are:
   - the bucket, named `vci-v4-terraform-state-<account ID>-us-west-2`
   - its ownership controls, public access block, versioning, encryption, lifecycle rules and bucket policy

   **Stop if:**
   - **anything says `change` or `destroy`**
   - **you see `AWS account ID not allowed`:** the profile on the command points at a different account than `terraform.tfvars` names, or you left the profile off
   - **you see `AccessDenied`:** your role or an organization policy doesn't allow this

4. **Create the bucket:**
   ```bash
   AWS_PROFILE=non-prod terraform apply bootstrap.tfplan
   ```
   Expect `Apply complete! Resources: 7 added, 0 changed, 0 destroyed.` and an output `state_bucket = "vci-v4-terraform-state-…"`.

5. **Record the bucket name for the account:**
   ```bash
   cp ../backend.hcl.example ../backend.hcl
   terraform output -raw state_bucket
   ```
   Put the printed name into `../backend.hcl` as the `bucket` value.

6. **Move this folder's state into the bucket.** Until now it has been in a local file. In `backend.tf`, uncomment the `terraform { backend "s3" { … } }` block by removing the leading `# ` from those lines, then run:
   ```bash
   AWS_PROFILE=non-prod terraform init -migrate-state -backend-config=../backend.hcl
   ```
   Answer `yes` when asked *Do you want to copy existing state to the new backend?* Expect `Successfully configured the backend "s3"!`

7. **Confirm:**
   ```bash
   AWS_PROFILE=non-prod terraform plan
   AWS_PROFILE=non-prod aws s3 ls "s3://$(AWS_PROFILE=non-prod terraform output -raw state_bucket)/accounts/non-prod/bootstrap/"
   ```
   Expect `No changes. Your infrastructure matches the configuration.`, and a listing showing `terraform.tfstate`.

8. **Remove the local copies, but only after step 7 succeeds:**
   ```bash
   rm terraform.tfstate terraform.tfstate.backup bootstrap.tfplan
   ```

9. **Commit** the uncommented `backend.tf`, so future runs use the bucket from the start.

The bucket is protected from deletion (`prevent_destroy`), on purpose: it holds the record of everything Terraform manages in the account.

## Next steps

| Step | Builds |
|------|--------|
| 2 | The `vci-v4` VPC: public subnets for the API and load balancer, private subnets for the database |
| 3 | Dev stack backend: ECR, RDS Postgres, ECS API, load balancer, security groups |
| 4 | Dev stack frontend: S3 + CloudFront |
| 5 | GitHub deploy role, CD workflow, CI infrastructure scan |

## Checks run before each step

Before a step is handed over, its code is checked locally without AWS credentials, using the same Terraform version:
- `terraform fmt` for formatting
- `terraform validate` for syntax and references
- a [checkov](https://www.checkov.io) security scan

Any skipped checkov rule is marked in the code with its reason.
