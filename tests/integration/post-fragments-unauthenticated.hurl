# tests/integration/post-fragments-charset.hurl
# POST /v1/fragments without authentication should fail
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`This is a fragment!`

# We expect unauthenticated requests to be rejected
HTTP/1.1 401
Content-Type: application/json; charset=utf-8

[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect the error code to be 401
jsonpath "$.error.code" == 401
# We expect the error message to describe a missing route
jsonpath "$.error.message" == "Unauthorized"
