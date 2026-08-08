# tests/integration/get-fragment-json-conversion.hurl
# Test JSON to plain-text conversion

# 1. Create a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
test-user1@fragments-testing.com: test-password1

{"service":"Fragments"}

HTTP/1.1 201

[Captures]
url: header "Location"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

# 2. Convert JSON to plain text
GET {{url}}.txt

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" contains "text/plain"
body == "{\"service\":\"Fragments\"}"

# 3. Delete the test fragment
DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
