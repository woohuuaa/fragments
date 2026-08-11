# tests/integration/get-fragment-info.hurl
# Confirm that an authenticated user can get fragment metadata by id

GET http://localhost:8080/v1/fragments/missing-id/info

HTTP/1.1 401

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`# Fragment info`

HTTP/1.1 201

[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"
owner_id: jsonpath "$.fragment.ownerId"
created: jsonpath "$.fragment.created"

GET {{url}}/info

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{id}}"
jsonpath "$.fragment.ownerId" == "{{owner_id}}"
jsonpath "$.fragment.created" == "{{created}}"
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 15

GET {{url}}/info

[BasicAuth]
test-user2@fragments-testing:test-password2

HTTP/1.1 404

GET http://localhost:8080/v1/fragments/missing-id/info

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
