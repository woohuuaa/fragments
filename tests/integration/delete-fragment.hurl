# tests/integration/delete-fragment.hurl
# Confirm that an authenticated user can delete an existing fragment

DELETE http://localhost:8080/v1/fragments/missing-id

HTTP/1.1 401

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`Delete fragment`

HTTP/1.1 201

[Captures]
url: header "Location"

DELETE {{url}}

[BasicAuth]
test-user2@fragments-testing:test-password2

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"

GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
