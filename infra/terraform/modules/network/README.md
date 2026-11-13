# network

Creates a VPC (a private network in one AWS account and region) with public and private subnets in two or more availability zones, plus VPC flow logs.

## How the network is laid out

- **Public subnets** have a route to the internet gateway, so resources in them can reach the internet. Nothing gets a public IP address automatically; a resource that needs one, like an API container, asks for it.
- **Private subnets** only have the VPC's built-in local route. Nothing in them can reach the internet, and the internet can't reach them.
- **Security groups**, the firewall around each resource, are created next to the resources they protect, not here.

Each subnet sits in one availability zone (a separate data center in the region). Load balancers and RDS databases need subnets in at least two.

## What it creates

| Resource | Purpose |
|---|---|
| VPC | The network, with DNS names turned on. Terraform refuses to delete it (`prevent_destroy`) |
| Default security group, with no rules | Every VPC has one that lets its members reach each other. Emptying it means nothing relies on it by accident |
| Internet gateway | The VPC's connection to the internet |
| Public subnets, route table, route → internet gateway | One subnet per availability zone |
| Private subnets, route table with no internet route | One subnet per availability zone |
| VPC flow log | Records every connection in the VPC: addresses, ports, bytes, and whether it was accepted or rejected. Never the traffic's contents |
| S3 bucket `<name>-flow-logs-<account ID>-<region>` | Receives the flow logs in 10-minute files. Private, encrypted, HTTPS only, files deleted after `flow_log_retention_days` |

Subnets are tagged `Tier = public` or `Tier = private`, so other folders can find them by tag.

## Inputs

| Name | Default | Description |
|---|---|---|
| `name` | `vci-v4` | VPC name, and the start of every other name |
| `cidr_block` | | The VPC's address range |
| `availability_zones` | | At least two, for example `["us-west-2a", "us-west-2b"]` |
| `public_subnet_cidrs` | | One range per availability zone, inside `cidr_block` |
| `private_subnet_cidrs` | | One range per availability zone, inside `cidr_block` |
| `flow_log_retention_days` | `90` | Days to keep flow log files |

### Address ranges (CIDRs)

A CIDR is a range of addresses. See [VPC CIDR blocks](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-cidr-blocks.html).

## Outputs

| Name | Description |
|---|---|
| `vpc_id` | ID of the VPC |
| `vpc_cidr_block` | Address range of the VPC |
| `public_subnet_ids` | Public subnet IDs, in `availability_zones` order |
| `private_subnet_ids` | Private subnet IDs, in `availability_zones` order |
| `flow_log_bucket` | Name of the flow log bucket |

## Reading flow logs

Download files from the bucket in the S3 console (under `AWSLogs/<account ID>/vpcflowlogs/`), or query them with [Athena](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs-athena.html). Each line is one connection; the fields are described in [Flow log records](https://docs.aws.amazon.com/vpc/latest/userguide/flow-log-records.html).

## Used by

`accounts/<account>/network`.
