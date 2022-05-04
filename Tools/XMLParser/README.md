# A Simple XML Parser for Embedded JavaScript Environment
## Usage
```javascript
const ParseXML = new XMLParser();
const testXML = '<xml foo="FOO"><bar><baz>BAZ</baz></bar></xml>';
const data = ParseXML(testXML);

console.log(data.xml.bar.baz); // => "BAZ"
console.log(data.xml["@foo"]); // => "FOO"
```

In the above example,
```xml
<xml foo="FOO">
  <bar>
    <baz>BAZ</baz>
  </bar>
</xml>
```
is converted into a plain JavaScript object:

```js
{
  "xml": {
    "@foo": "FOO",
    "bar": {
      "baz": "BAZ"
    }
  }
}
```

## Credit
This script is adapted from Kawanet's [fromXML](https://github.com/kawanet/from-xml).