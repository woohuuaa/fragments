# tests/integration/post-fragments-charset.hurl
# POST with charset should preserve the full Content-Type
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`This is a fragment!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"
jsonpath "$.fragment.size" == 19

[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 19

[Asserts]
body == "This is a fragment!"
