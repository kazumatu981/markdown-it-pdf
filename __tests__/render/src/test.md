# markdown-it-pdf

## abstract

## function

```TypeScript
import { MarkdownItPdf } from 'markdown-it-pdf';

const printer = await MarkdownItPdf.createPdfPrinter(logger, {
    rootDir: `${__dirname}/src`,
    port: 3001,
});

await printer.printAll(`${__dirname}/out`);
```

## refer to

* [markdown-it](https://www.npmjs.com/package/markdown-it)
* [puppeteer](https://www.npmjs.com/package/puppeteer)