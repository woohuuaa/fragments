# tests/integration/get-fragment-conversion.hurl
# Confirm that an authenticated user can convert a Markdown fragment to HTML

# 1. Create a Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown

[BasicAuth]
test-user1@fragments-testing.com: test-password1

`# Hello World`

HTTP/1.1 201

[Captures]
url: header "Location"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 13

# 2. Convert Markdown to HTML
GET {{url}}.html

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" contains "text/html"
body contains "<h1>Hello World</h1>"

# 3. Convert Markdown to plain text
GET {{url}}.txt

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" contains "text/plain"
body == "# Hello World"

# 4. Unsupported Markdown to PNG conversion
GET {{url}}.png

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 415

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415

# 5. Delete the test fragment
DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com: test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
