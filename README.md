# templated-pdf
PDF generation using an XML source. Can generate a file, buffer or stream.

## Usage as a function
```
const pdf = require('express-hogan-pdf');

pdf.toStream(xml, basePath, (err, stream) => {});
pdf.toBuffer(xml, basePath, (err, buffer) => {});
pdf.toFile(xml, basePath, destFile, (err) => {});

```

## Usage as an express streaming engine
```
app.get('/path', (req, res, next) => {
    let xml = '<pdf>xmldata</pdf>';
    pdf.toStream(xml, '/base/path/for/images', (err, stream) => {
        if (err) return next(err);
        res.attachment(stream.filename);
        stream.pipe(res);
    });
});

```

## PDF XML example
``` filename.pdfxml
<pdf>
  <config>
    <filename>my-file.pdf</filename>
    <document size="A4" marginBottom="50">
    <title>{{title}}</title>
    <colors darkred="#800"/>
    <styles>

    </styles>
  </config>
  <page>
    <h1>{{title}}</h1>
    <h2>Page 1</h2>
    <indent>
      <p>Indented text</p>
    </indent>
    <hr thickness="6"/>
    <row>
      <column width="33%">Column 1</column>
      <column width="66%">Column 2</column>
    </row>
    <div>
        A link to <a>example.com</a>
    </div>
  </page>
  <page>
    <h1 top="33%" left="100">Page 2</h1>
  </page>
</pdf>
```

## PDF XML format
The XML format wraps most of PDFKit's available options.

The document must be wrapped in `<pdf></pdf>` tags

- `<config>` Configuration section:
    + `<document>` PDFKit document options, eg: `<document size="A4"/>`
    + `<title>` Set document title
    + `<meta>` Set PDF meta details such as `<author>`, `<subject>`, or `<keywords>`
    + `<colors>` Color aliases, eg `<colors darkred="#880000"/>`
    + `<fonts>` Font aliases, eg `<fonts comic="Comic Sans Regular"/>`
    + `<filename>` Set document filename
    + `<title>` Set document title
    + `<styles>` Add or change page tag style definintions, eg: `<styles><redtext extends="span" color="red"/></styles>`
        * Elements attributes can include:
            - `extends="String"` Style definition to extend
            - `display="String"` Can be `block` or `inline`
            - `marginLeft="Number"` Margin left
            - `marginRight="Number"` Margin right
            - `paddingLeft="Number"` Padding left
            - `paddingRight="Number"` Padding right
            - `color="String"` Text color or alias
            - `font="String"` Font alias, name or path
            - `size="Number"` Font size
            - `underline="Boolean"` Underline text
            - `strike="Boolean"` Strikethrough text
            - `lineGap="Number"` Line gap between wrapped lines
            - `paragraphGap="Number"` Gaps between paragraphs
            - `align="String"` text alignment
            - `pre="Boolean"` Respect exact whitespace in tags
            - `trim="Boolean"` Trim whitespace at start of each line
        * Block elements can also include the following attributes:
            - `marginTop="Number"` Margin top
            - `marginBottom="Number"` Margin bottom
            - `paddingTop="Number"` Padding top
            - `paddingBottom="Number"` Padding bottom
            - `width="Number"` Width as an absolute or as a percentage of the parent block
            - `height="Number"` Height as an absolute or as a percentage of the page height within the page margins
            - `backgroundColor="String"` Background color or color alias. Background will only be filled if both a height and width are given
            - `border="Number"` Border width. A border will only be drawn if both a height and width are given
            - `borderColor="String"` Border color or color alias
- `<page>` A page to render. Can take any PDFKit page options, such as page
    + Predefined styles and tags that are similar to HTML include:
        * `<div>`
        * `<p>`
        * `<span>`
        * `<strong>`
        * `<small>`
        * `<indent>` Indent text by `paddingLeft` and show a left bar of `thickness` and `color`
            - `thickness="Number"` Width of indent bar
            - `color="String"` Color or color alias of indent bar
        * `<hr>` Horizontal rule divider line
            - `thickness="Number"` Height of divider line
            - `color="String"` Color or color alias of divider line
        * `<row>` A container for a set of columns
        * `<column>` A left-aligned column within a row. Columns wrap within the row if the next column can't fit within the row's width
        * `<img>` Draw an image
            - `src="String"` Source of the image to draw relative to the template file
            - `scale="Number"` Size of image relative to its original
            - `fit="Boolean"` Fit image within the width and height without chaning its aspect ratio
        * `<a>` Create a web link for the contained text.
            - `href="String"` The link to go to when clicked. If no `href` is specified an href is created by adding `https://` to the beginning of the text
