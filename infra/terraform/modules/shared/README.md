# shared

Creates the resources that every stack in one AWS account uses. Each stack then adds only its own parts: an API service, a database on the shared server, and a frontend.

Needs the account's network (see [`modules/network`](../network)), which it finds by the VPC's name.

## What it creates

| Part | Purpose |
|---|---|
| Image registry `<name>-api` (ECR) | Stores the API's Docker images. Tags can't be overwritten, images are scanned on push, and older images are cleaned up |
| ECS cluster `<name>` | Where every stack's API service runs. Stacks can use regular Fargate or Fargate Spot |
| Security groups `<name>-lb`, `<name>-api`, `<name>-db` | Firewalls for the load balancer, API containers and database. Each accepts traffic only from the layer in front of it |
| Postgres server `<name>` (RDS) | One server for the account. Each stack gets its own database and login on it. RDS keeps the admin password in Secrets Manager |
| Internal load balancer `<name>` | Sends each request to the right stack by hostname. Unknown hostnames get a 404 |
| CloudFront VPC origin `<name>` | The private connection from CloudFront to the load balancer, used by every stack |
| SSM parameter `/<name>/shared/cloudfront-vpc-origin-id` | The VPC origin's ID, for stack folders to read |

The database server and load balancer are protected from deletion.

## Inputs

| Name | Default | Description |
|---|---|---|
| `name` | `vci-v4` | The VPC's name, and the start of every resource name |
| `db_instance_class` | | Database server size |
| `db_allocated_storage` | `20` | Starting storage, in GB |
| `db_max_allocated_storage` | `100` | Most storage RDS may grow to on its own, in GB |
| `db_multi_az` | `false` | Keep a standby copy in a second availability zone |
| `db_backup_retention_days` | `7` | Days to keep automated backups |
| `log_retention_days` | `30` | Days to keep database logs |
| `image_retention_count` | `100` | Number of recent images to keep. Keep it above what any running stack might still use |

## Outputs

| Name | Description |
|---|---|
| `ecr_repository_url` | Where to push API images |
| `ecs_cluster_name` | ECS cluster name |
| `db_instance_identifier` | Postgres server identifier |
| `db_admin_secret_arn` | Secret holding the database admin login |
| `load_balancer_name` | Load balancer name |
| `vpc_origin_parameter` | SSM parameter holding the VPC origin ID |

## How stack folders find these

Stack folders never read this folder's state. They look resources up by name with `data` sources (`aws_ecr_repository`, `aws_ecs_cluster`, `aws_lb`, `aws_db_instance`, `aws_security_group`), and read the VPC origin ID from its SSM parameter, because there's no lookup for VPC origins.

## Used by

`accounts/<account>/shared`.
