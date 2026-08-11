# tests/integration/get-fragments.hurl
# Confirm that GET /v1/fragments returns the authenticated user's fragment IDs

GET http://localhost:8080/v1/fragments

HTTP/1.1 401

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`List fragment`

HTTP/1.1 201

[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

GET http://localhost:8080/v1/fragments

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection
jsonpath "$.fragments" contains "{{id}}"

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
