# tests/integration/get-fragments-expand.hurl
# Confirm that GET /v1/fragments?expand=1 returns expanded fragment metadata

GET http://localhost:8080/v1/fragments?expand=1

HTTP/1.1 401

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`Expanded fragment`

HTTP/1.1 201

[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

GET http://localhost:8080/v1/fragments?expand=1

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection
jsonpath "$.fragments[*].id" contains "{{id}}"
jsonpath "$.fragments[*].ownerId" isCollection
jsonpath "$.fragments[*].created" isCollection
jsonpath "$.fragments[*].updated" isCollection
jsonpath "$.fragments[*].type" contains "text/plain"
jsonpath "$.fragments[*].size" contains 17

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
