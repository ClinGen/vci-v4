# state-bucket

Creates the private S3 bucket where Terraform stores state for every folder in one AWS account.

## What it creates

| Resource | Purpose |
|---|---|
| S3 bucket `<name_prefix>-terraform-state-<account ID>-<region>` | Holds the state files. Terraform refuses to delete it (`prevent_destroy`) |
| Versioning | Keeps earlier versions of each state file, so a bad write can be rolled back |
| Lifecycle rule | Deletes earlier versions after `noncurrent_version_retention_days`, and unfinished uploads after 7 days |

## Inputs

| Name | Default | Description |
|---|---|---|
| `name_prefix` | `vci-v4` | Start of the bucket name |
| `noncurrent_version_retention_days` | `90` | Days to keep earlier versions of state files |

## Outputs

| Name | Description |
|---|---|
| `bucket_name` | The bucket name, for each folder's `backend.hcl` |
| `bucket_arn` | The bucket ARN, for IAM policies that need access to state |

## Used by

`accounts/<account>/bootstrap`.
