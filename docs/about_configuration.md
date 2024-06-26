# About Configurations

This library has many configuration options.
Here we will explain these options.

These options are explained below.

 You can specify them in a JavaScript or JSON file that is specified using the `--config` option of the CLI, or as arguments when using the API.

## File format

The configuration file must be a JavaScript or JSON file.
This file is specified using the `--config` option of the CLI.

example(js):

```javascript
module.export = {
    rootDir: './markdown',
    recursive: true,
    margin: {
        top: '12.7mm',
        bottom: '12.7mm',
        left: '12.7mm',
        right: '12.7mm'
    }
}
```

example(json):


```json
{
    "rootDir": "./markdown",
    "recursive": true,
    "margin": {
        "top": "12.7mm",
        "bottom": "12.7mm",
        "left": "12.7mm",
        "right": "12.7mm"
    }
}
```


> **remark** This library **NOT** support `module` like JS file.
> So you have to write configure common.js style JavaScript file. 

## Configuration options

### Contents options

These options describe the contents to be rendered.
These options are used when searching for files.

| Name | Type | Description | Default |
| -- | --| -- | -- |
| rootDir | String | The root directory to search for files. | `./` |
| recursive | Boolean | Whether to recursively search for files. | `true` |
| externalUrls | String[] | The external URLs to be used. | `[]` | 

### Server OPtion

These options describe setting for the server.
These options are used when launching the server and to start listening from self, other processes or machines.

| Name | Type | Description | Default |
| -- | --| -- | -- |
| port | Number | The port number to be used. | `3000` |
| retry | Number | The number of retries. | `10` |
| range | Range | The range of ports to be used. | `{ min: 49152, max: 65535 }` |

if the `port` is undefined, 

#### Range

| Name | Type | Description | Default |
| -- | --| -- | -- |
| min | Number | The minimum port number. | `49152` |
| max | Number | The maximum port number. | `65535` |

### Markdown Rendering options

| Name | Type | Description | Default |
| -- | --| -- | -- |
| templatePath | String | The path to the template file. | undefined |
| hljs | HljsConfig | false | The configuration of the [highlight.js](https://highlightjs.org/) library. | undefined |


#### HljsConfig

| Name | Type | Description | Default |
| -- | --| -- | -- |
| js | String | The style name of the [highlight.js](https://highlightjs.org/) library. | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js'` |
| css | String | The path to the CSS file of the [highlight.js](https://highlightjs.org/) library. | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css` |

### Pdf OPtions

| Name | Type | Description | Default |
| -- | --| -- | -- |
| format | String | The format of the PDF. | `undefined` |
| margin | Margin | The margin of the PDF. | `{ top: '12.7mm', bottom: '12.7mm', left: '12.7mm', right: '12.7mm' }` |
| header | Header | The header of the PDF. | `undefined` |
| footer | Footer | The footer of the PDF. | `undefined` |
| pageOrientation | String | The orientation of the PDF. | `undefined` |

#### Margin Options

| Name | Type | Description | Default |
| -- | --| -- | -- |
| top | String | The top margin of the PDF. | `undefined` |
| bottom | String | The bottom margin of the PDF. | `undefined` |
| left | String | The left margin of the PDF. | `undefined` |
| right | String | The right margin of the PDF. | `undefined` |

