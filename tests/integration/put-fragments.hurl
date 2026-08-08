# tests/integration/put-fragments.hurl
# Confirm that an authenticated user can update an existing fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com: test-password1

`This is a fragment!`

HTTP/1.1 201

[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"
owner_id: jsonpath "$.fragment.ownerId"
created: jsonpath "$.fragment.created"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19

PUT {{url}}
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com: test-password1

`Updated fragment!`

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{id}}"
jsonpath "$.fragment.ownerId" == "{{owner_id}}"
jsonpath "$.fragment.created" == "{{created}}"
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 17

GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 17

[Asserts]
body == "Updated fragment!"

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
