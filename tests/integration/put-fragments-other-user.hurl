# tests/integration/put-fragments-other-user.hurl
# Confirm that a user cannot update another user's fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com: test-password1

`Private data`

HTTP/1.1 201

[Captures]
url: header "Location"

PUT {{url}}
Content-Type: text/plain

[BasicAuth]
test-user2@fragments-testing: test-password2

`Changed by another user`

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200
