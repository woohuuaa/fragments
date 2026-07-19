# 404 Not Found Test
GET http://localhost:8080/no-such-route

# We should get back an HTTP 1.1 404 response
HTTP/1.1 404
# We should get back a JSON error response
Content-Type: application/json; charset=utf-8

# Extra checks to perform against the response
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect the error code to be 404
jsonpath "$.error.code" == 404
# We expect the error message to describe a missing route
jsonpath "$.error.message" == "not found"
