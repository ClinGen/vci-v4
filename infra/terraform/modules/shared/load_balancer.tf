# Internal load balancer, reached only by CloudFront through a VPC origin.
# Each stack adds one rule to the listener, matching its CloudFront hostname.
# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-vpc-origins.html

resource "aws_lb" "this" {
  #checkov:skip=CKV_AWS_91:Access logs need a log bucket with load balancer delivery permissions; not needed yet.
  #checkov:skip=CKV2_AWS_28:A web application firewall belongs on CloudFront, in front of every stack, if one is added.
  #checkov:skip=CKV2_AWS_20:Redirecting to HTTPS needs an HTTPS listener, which needs a custom domain; viewers use HTTPS to CloudFront.
  name               = var.name
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = data.aws_subnets.private.ids

  drop_invalid_header_fields = true
  enable_deletion_protection = true

  lifecycle {
    prevent_destroy = true
  }
}

# HTTP between CloudFront and the load balancer, over the private VPC origin connection.
# HTTPS here needs a certificate for a domain, which comes with a custom domain.
resource "aws_lb_listener" "http" {
  #checkov:skip=CKV_AWS_2:Reached only through the private VPC origin connection; viewers use HTTPS to CloudFront. HTTPS here needs a custom domain.
  #checkov:skip=CKV_AWS_103:No TLS on this listener yet; see CKV_AWS_2.
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  # Requests for a hostname no stack has claimed get a 404.
  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not found"
      status_code  = "404"
    }
  }
}

# The private connection from CloudFront into the VPC. Every stack's CloudFront distribution uses it.
# Creating it takes about 15 minutes.
resource "aws_cloudfront_vpc_origin" "this" {
  vpc_origin_endpoint_config {
    name                   = var.name
    arn                    = aws_lb.this.arn
    http_port              = 80
    https_port             = 443
    origin_protocol_policy = "http-only"

    origin_ssl_protocols {
      items    = ["TLSv1.2"]
      quantity = 1
    }
  }

  tags = {
    Name = var.name
  }
}

# Stack folders read the VPC origin ID from here; there's no lookup for VPC origins by name.
# https://developer.hashicorp.com/terraform/language/state/remote-state-data
resource "aws_ssm_parameter" "vpc_origin_id" {
  #checkov:skip=CKV2_AWS_34:Holds a resource ID, not a secret.
  name        = "/${var.name}/shared/cloudfront-vpc-origin-id"
  description = "ID of the CloudFront VPC origin for the ${var.name} load balancer"
  type        = "String"
  value       = aws_cloudfront_vpc_origin.this.id
}
