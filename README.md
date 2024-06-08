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

### **[step0]:** Install the library

create npm project and install this library with `npm`

```bash
npm init -y
npm install -D markdown-it-pdf
```

> Of course, you can install it globally or use it as a command only without installing it (using `npx` command).

### **[step1]:** First of all you write documents in Markdown

First, create the source code documents in Markdown with the following directory structure:

```text
<project-root>
+ src
  + img
  | + logo.png
  | + img001.jpg
  + sub01
  | + sub01-001.md
  | + sub01-002.md
  + styles
  | + style001.css
  | + style002.css
  + sample001.md
  + sample002.md
+ package.json
+ node_modules
```

* You can convert multiple Markdown files to PDF files in bulk.
* The target files are searched recursively.
* You can also specify the style (`css`) to be applied to Markdown.
* You can also specify the image data (`png` or `jpg`) to be used in Markdown.

### **[step2]:** Determine the rendering method.

You can select the rendering method as follows:

|Method| Summary |
|---|---|
| CLI Printer | You can generate PDF files in bulk by using the CLI. |
| CLI Server | You can start an HTTP server on `localhost` to distribute HTML files generated from Markdown. |
| Node.js API | You can embed it in your own application and convert Markdown to PDF. |

### **[step3][CLI]** Configure

Create configuration file (named `markdown-it-pdf-config.json`) on root directory like bellow:

```json
{
    "recursive": true,
    "externalUrls": ["https://hoo.bar/styles/test.css"],
    "margin": {
        "top": "12.7mm",
        "bottom": "12.7mm",
        "left": "12.7mm",
        "right": "12.7mm"
    }
}
```

See more information on [this article - About Configurations](docs/about_configuration.md).

### [step4][CLI] Execute

This tool include Command Line Interface which launches the server and prints the output them pages to the files as PDF.

#### Printer: Convert multiple Markdown files to PDFs

```bash
markdown-it-pdf print src pdf --config markdown-it-pdf-config.json
```

If you want to print(convert) markdown files into PDF files, then you use `print` command.
First option is the root directory of the markdown files.
Second option is the output directory of the PDF files.

#### Server: Start the HTTP server to distribute HTML

```bash
markdown-it-pdf serve src --config markdown-it-pdf-config.json
```

If you want to start the HTTP server to distribute HTML, then you use `serve` command.
For example if you want to print yourself, want to share your MD files with others, or want to debug before writing `CSS` files, then you use `serve` command.

The first option is the root directory of the markdown files.

#### Other options for the CLI

|Option| Alias | Summary |
|---|---|---|
| --config | -c | Specify the configuration file path. |
| --log | -l | Specify the log level. `trace`, `debug`,`info`,`warn`,`error`,`silent`|
| --help | -h | Show help. |
| --version | -v | Show version. |

### [step3][API] Create Application


#### Embed into your service(app)

See more information on [this article - About APIs](docs/about_apis.md).
