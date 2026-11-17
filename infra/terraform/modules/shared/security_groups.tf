# Firewall rules between the layers:
#   CloudFront → load balancer → API containers → database
# Each group only accepts traffic from the one before it. Rules reference other groups, not addresses.
# Terraform removes the allow-all outbound rule AWS adds to new groups, so only the rules below exist.

data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_security_group" "lb" {
  name        = "${var.name}-lb"
  description = "Internal load balancer: accepts traffic from CloudFront only"
  vpc_id      = data.aws_vpc.main.id

  tags = {
    Name = "${var.name}-lb"
  }
}

resource "aws_security_group" "api" {
  #checkov:skip=CKV2_AWS_5:Attached to each stack's API service, which the stack folder creates.
  name        = "${var.name}-api"
  description = "API containers of every stack: accept traffic from the load balancer only"
  vpc_id      = data.aws_vpc.main.id

  tags = {
    Name = "${var.name}-api"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.name}-db"
  description = "Postgres server: accepts traffic from API containers only"
  vpc_id      = data.aws_vpc.main.id

  tags = {
    Name = "${var.name}-db"
  }
}

# --- Load balancer ---

resource "aws_vpc_security_group_ingress_rule" "lb_from_cloudfront" {
  #checkov:skip=CKV_AWS_260:The source is CloudFront's managed prefix list, not 0.0.0.0/0; checkov doesn't read prefix_list_id on this resource type.
  security_group_id = aws_security_group.lb.id
  description       = "HTTP from CloudFront"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  prefix_list_id    = data.aws_ec2_managed_prefix_list.cloudfront.id
}

resource "aws_vpc_security_group_egress_rule" "lb_to_api" {
  security_group_id            = aws_security_group.lb.id
  description                  = "To API containers"
  ip_protocol                  = "tcp"
  from_port                    = local.api_port
  to_port                      = local.api_port
  referenced_security_group_id = aws_security_group.api.id
}

# --- API containers ---

resource "aws_vpc_security_group_ingress_rule" "api_from_lb" {
  security_group_id            = aws_security_group.api.id
  description                  = "From the load balancer"
  ip_protocol                  = "tcp"
  from_port                    = local.api_port
  to_port                      = local.api_port
  referenced_security_group_id = aws_security_group.lb.id
}

resource "aws_vpc_security_group_egress_rule" "api_to_https" {
  security_group_id = aws_security_group.api.id
  description       = "HTTPS to external data sources, Clerk, and AWS services (ECR, Secrets Manager, CloudWatch Logs)"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "api_to_db" {
  security_group_id            = aws_security_group.api.id
  description                  = "To the Postgres server"
  ip_protocol                  = "tcp"
  from_port                    = local.postgres_port
  to_port                      = local.postgres_port
  referenced_security_group_id = aws_security_group.db.id
}

# --- Database: accepts from the API, sends nothing ---

resource "aws_vpc_security_group_ingress_rule" "db_from_api" {
  security_group_id            = aws_security_group.db.id
  description                  = "From API containers"
  ip_protocol                  = "tcp"
  from_port                    = local.postgres_port
  to_port                      = local.postgres_port
  referenced_security_group_id = aws_security_group.api.id
}
