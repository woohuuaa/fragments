# tests/integration/put-fragments-wrong-type.hurl
# Confirm that PUT cannot change a fragment's Content-Type

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com: test-password1

`Original data`

HTTP/1.1 201

[Captures]
url: header "Location"

PUT {{url}}
Content-Type: application/json

[BasicAuth]
test-user1@fragments-testing.com: test-password1

`{"message":"wrong type"}`

HTTP/1.1 400

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 400

DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200
