# tests/integration/get-fragment-image-conversion.hurl
# Test PNG to JPEG conversion

# 1. Create a PNG fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png

[BasicAuth]
test-user1@fragments-testing.com: test-password1

file,test.png;

HTTP/1.1 201

[Captures]
url: header "Location"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/png"

# 2. Convert PNG to JPEG
GET {{url}}.jpg

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200
Content-Type: image/jpeg

# 3. Delete the test fragment
DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
