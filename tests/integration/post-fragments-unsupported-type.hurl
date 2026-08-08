# tests/integration/post-fragments-unsupported-type.hurl

# Authenticated POST to /v1/fragments with an unsupported Content-Type
POST http://localhost:8080/v1/fragments

Content-Type: application/pdf

[BasicAuth]
test-user1@fragments-testing.com:test-password1

# Send a fake binary-like body
`not really a png`

# We expect unsupported fragment types to return HTTP 415
HTTP/1.1 415
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
jsonpath "$.error.message" == "Unsupported Media Type"
