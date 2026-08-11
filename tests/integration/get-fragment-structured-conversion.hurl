# tests/integration/get-fragment-structured-conversion.hurl
# CSV -> JSON
POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
test-user1@fragments-testing.com:test-password1
file,conversion.csv;

HTTP/1.1 201
[Captures]
csv_url: header "Location"

GET {{csv_url}}.json
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json
[Asserts]
jsonpath "$[0].name" == "Alice"
jsonpath "$[0].city" == "Toronto, ON"

DELETE {{csv_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1
HTTP/1.1 200

# JSON -> YAML
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
file,conversion.json;

HTTP/1.1 201
[Captures]
json_url: header "Location"

GET {{json_url}}.yaml
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/yaml
[Asserts]
body contains "service: Fragments"
body contains "storage: DynamoDB"

DELETE {{json_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1
HTTP/1.1 200


