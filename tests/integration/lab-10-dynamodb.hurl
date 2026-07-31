# tests/integration/lab-10-dynamodb.hurl
# Test the fragments API with DynamoDB

# 1. Create the first fragment: application/json
# Authenticated POST to /v1/fragments

POST http://localhost:8080/v1/fragments

# We're sending a json fragment
Content-Type: application/json

# Include HTTP Basic Auth credentials
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# Body of the request goes in ```...``` when it's a string
`{ "service": "DynamoDB" }`

HTTP/1.1 201

[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

jsonpath "$.status" == "ok"

# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"

# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"

# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25

# Capture the Location header value and the fragment's id in variables named fragment1_url and fragment1_id
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. Try to GET the fragment's json metadata we just posted by its URL

GET {{fragment1_url}}/info

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]{64}$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25

# 3. POST a second text/markdown fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`DynamoDB is **great**.`

HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]{64}$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 4. Try to GET the second text/markdown fragment we just posted by its URL

GET {{fragment2_url}}/info

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]{64}$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22


# 5. GET all of the fragments for the same authorized user without expanding them (i.e., just get back the IDs) and 
#    confirm that the list of fragments includes the two id values you captured above

GET http://localhost:8080/v1/fragments

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection
jsonpath "$.fragments" includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"


# 6. Delete the first fragment

DELETE {{fragment1_url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"

# 7. Try to get the deleted first fragment again

GET {{fragment1_url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404

# 8. GET all of the fragments for the same authorized user without expanding them (i.e., just get back the IDs) a second time, and 
#    confirm that the first id is NOT included but that the second id is (i.e., that the second was not deleted).

GET http://localhost:8080/v1/fragments

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" isCollection
jsonpath "$.fragments" not includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"


