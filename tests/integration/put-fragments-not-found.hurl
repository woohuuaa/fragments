# tests/integration/put-fragments-not-found.hurl
# Confirm that updating a missing fragment returns 404

PUT http://localhost:8080/v1/fragments/nonexistent-id
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com: test-password1

`Updated data`

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
