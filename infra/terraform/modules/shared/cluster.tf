# ECS cluster: a free grouping that every stack's API service runs in.

resource "aws_ecs_cluster" "this" {
  #checkov:skip=CKV_AWS_65:Container Insights is billed per metric; service logs and basic ECS metrics are enough for now.
  name = var.name

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

# Stacks choose between regular Fargate and Fargate Spot (spare capacity at a discount,
# which AWS can reclaim with two minutes' warning).
resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name       = aws_ecs_cluster.this.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}
