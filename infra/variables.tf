variable "root_domain" {
  type    = string
  default = "crossangles.app"
}

variable "campuses" {
  type    = list(string)
  default = ["unsw"]
}

variable "app_version" {
  type = string
}

variable "scraper_version" {
  type = string
}

variable "contact_version" {
  type = string
}

variable "code_bucket" {
  type    = string
  default = "crossangles-lambda-code"
}

variable "mailgun_key" {
  type    = string
  default = ""
}

variable "pjsc_key" {
  type    = string
  default = ""
}
