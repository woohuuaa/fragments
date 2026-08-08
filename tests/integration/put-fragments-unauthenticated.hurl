# tests/integration/put-fragments-unauthenticated.hurl
# Confirm that updating a fragment without authentication returns 401

PUT http://localhost:8080/v1/fragments/random-id
Content-Type: text/plain

`Updated data`

HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
