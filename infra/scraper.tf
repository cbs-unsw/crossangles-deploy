provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.48"
}

resource "aws_lambda_function" "scraper" {
  function_name = "crossangles-scraper"

  # The bucket name as created earlier with "aws s3api create-bucket"
  s3_bucket = var.lambda_code_bucket
  s3_key    = "scraper/scraper.zip"

  # "main" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "main.handler"
  runtime     = "nodejs12.x"
  memory_size = 1024

  role = aws_iam_role.scraper_role.arn
}

resource "aws_iam_role" "scraper_role" {
  name = "iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2020-02-08",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "scraper_policy" {
  name        = "scraper-policy"
  description = "Lambda policy to allow writing to S3 bucket"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PutObjectActions",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": ["arn:aws:s3:::${aws_s3_bucket.scraper_output.bucket}/*"]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "scraper_policy_attach" {
  role       = aws_iam_role.scraper_role.name
  policy_arn = aws_iam_policy.scraper_policy.arn
}

resource "aws_s3_bucket" "scraper_output" {
  bucket = "crossangles-course-data"
  acl    = "public-read"

  tags = {
    Name        = "CrossAngles Data"
    Environment = "Staging"
  }
}

locals {
  s3_origin_id = "scraper_s3_origin"
}

resource "aws_cloudfront_origin_access_identity" "scraper_oai" {}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.scraper_output.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.scraper_oai.cloudfront_access_identity_path
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 1800
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
