variable environment {
  type = string
}

variable code_bucket {
  type    = string
  default = "crossangles-lambda-code"
}

variable code_key {
  type    = string
  default = "image/image.zip"
}

variable pjsc_key {
  type    = string
  default = ""
}
