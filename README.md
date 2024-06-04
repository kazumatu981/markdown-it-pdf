# markdown-it-pdf

## abstract

This library is a tool for rendering markdown files as a PDF file. 

It uses the following technologies:

- Markdown-it: for parsing markdown files.
- Puppeteer: for rendering HTML files as a PDF file.

With this library, you can easily generate PDF files from markdown files. 

## Features

* Render markdown files as PDF files via Command Line Interface.
* Host the html pages to have been Rendered from markdown files.
* Flexibly customizable, including:
    * Output directory and file name
    * HTML template
    * Paper size, margin, header, footer, etc. in the generated PDF
    * Markdown-it plugin for syntax extension
* Supports logging execution status

## How to Use.

### Command Line Interface: Convert multiple Markdown files to PDFs

```bash
npx markdown-it-pdf print src pdf
```

### HTTP Server: Start the HTTP server to render into HTML

```bash
npx markdown-it-pdf serve src
```

### Node.js API: Embed into your service(app)
