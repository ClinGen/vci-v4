# The network comes from the network folder. It's looked up by name and tag, never changed here.

locals {
  api_port      = 8000 # The port the API container listens on (backend/Dockerfile)
  postgres_port = 5432
}

data "aws_vpc" "main" {
  tags = {
    Name = var.name
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  tags = {
    Tier = "private"
  }

  lifecycle {
    postcondition {
      condition     = length(self.ids) >= 2
      error_message = "Expected private subnets in at least two availability zones. Apply the network folder first."
    }
  }
}
