# Terraform

This folder describes VCI v4's AWS infrastructure as code. Terraform reads these files, compares them with what exists in AWS, and shows you the changes (`terraform plan`) before making them (`terraform apply`).

## Layout

```
modules/                 Reusable building blocks. You don't run Terraform here.
  state-bucket/          The S3 bucket that holds Terraform's state
  network/               A VPC with public and private subnets and flow logs
  shared/                What every stack in an account uses: registry, cluster, database server, load balancer
accounts/<account>/      Things that exist once per AWS account (non-prod, prod)
  bootstrap/             Creates that account's state bucket
  network/               Creates that account's vci-v4 VPC
  shared/                Creates that account's shared resources
  backend.hcl.example    Template for the state bucket name
```

More folders are added as the infrastructure grows; `docs/deploy.md` lists what's built and what's next.

You run Terraform in a folder under `accounts/`. Each of those folders has its own **state**, Terraform's record of what it created, kept in the account's state bucket. A folder can only change what's in its own state, so working in one folder can't change another.

## Before you run anything

Follow [docs/deploy.md](../../docs/deploy.md). It covers installing the tools, choosing the AWS account with `AWS_PROFILE`, and the files you copy from their `.example` versions (Git ignores the copies).

## Conventions

- **Versions:** each folder pins the AWS provider in `versions.tf`, and `.terraform.lock.hcl` records the exact version and checksums. Commit lock files.
- **Account guard:** each folder only runs against the account ID in its `terraform.tfvars`.
- **Tags:** every resource gets `Project = "vci-v4"`, `ManagedBy = "terraform"` and the account name, set once in each folder's provider block.
- **Checks:** run `terraform fmt`, `terraform validate` and a [checkov](https://www.checkov.io) scan before opening a pull request. A skipped checkov rule is written next to the resource with its reason.
- **Changes:** every infrastructure change goes through a pull request. Don't change Terraform-managed resources in the AWS console; the next plan would undo it.
