# tests/integration/get-fragment-by-id.hurl
# Confirm that an authenticated user can get fragment data by id

GET http://localhost:8080/v1/fragments/missing-id

HTTP/1.1 401

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`Fragment by id`

HTTP/1.1 201

[Captures]
url: header "Location"

GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 14

[Asserts]
body == "Fragment by id"

GET {{url}}

[BasicAuth]
test-user2@fragments-testing:test-password2

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404

GET http://localhost:8080/v1/fragments/missing-id

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
