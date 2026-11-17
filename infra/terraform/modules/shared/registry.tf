# Image registry for the API. CD pushes one image per build, and each stack runs the tag it's given.

resource "aws_ecr_repository" "api" {
  #checkov:skip=CKV_AWS_136:AES-256 encryption managed by ECR is sufficient; a customer-managed KMS key adds cost without a requirement.
  name                 = "${var.name}-api"
  image_tag_mutability = "IMMUTABLE" # A tag always means the same image

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the ${var.image_retention_count} most recent images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = var.image_retention_count
      }
      action = {
        type = "expire"
      }
    }]
  })
}
