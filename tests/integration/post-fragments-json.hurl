# tests/integration/post-fragments-json.hurl
# POST a JSON fragment, then GET it back
POST http://localhost:8080/v1/fragments
# We're sending a josn fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
test-user1@fragments-testing.com:test-password1
# Body of the request goes in ```...``` when it's a string
`{"message":"hello","course":"CCP555"}`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 37

[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json
Content-Length: 37

[Asserts]
jsonpath "$.message" == "hello"
jsonpath "$.course" == "CCP555"
