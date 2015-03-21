# callas pdfaPilot CLI test project
This is a test project for callas pdfaPilot CLI. In order to run these tests node.js has to be installed first. To initialize the project run:

```
npm install
```

There are two tests, a simple one and one more advanced. Before running the tests edit some things in the tests themselves.
- iterations
- command
- tempDirectory
- endpoint

## The simple test
This test takes a .doc document, copies it X number of times and converts it. It then checks so that the PDF is a valid one. To execute run:
```javascript
node test.js
```

## The advanced test
This test is as follows:
- Generates a .docx document
- Inserts a unique hash in the document
- Converts it
- Checks that the document is a valid PDF
- Checks that the hash is the same in the PDF as in the .docx

To execute run:
```javascript
node index.js
```
